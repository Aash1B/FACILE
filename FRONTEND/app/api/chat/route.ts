import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CandidateProduct = {
  id: string | number;
  title: string;
  brand?: string;
  sellingPrice: number;
  mrp?: number;
  rating?: number;
  category?: string;
  subcategory?: string;
};

type IncomingMessage = { role: "user" | "assistant"; text: string };

const requestWindows = new Map<string, { count: number; resetsAt: number }>();

function isRateLimited(identifier: string) {
  const now = Date.now();
  const current = requestWindows.get(identifier);
  if (!current || current.resetsAt <= now) {
    requestWindows.set(identifier, { count: 1, resetsAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 20;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI assistant is not configured." }, { status: 503 });
  }

  const identifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(identifier)) {
    return NextResponse.json({ error: "Too many chat requests. Please wait a minute." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 700) : "";
  if (!message) return NextResponse.json({ error: "A message is required." }, { status: 400 });

  const history: IncomingMessage[] = Array.isArray(body.history)
    ? body.history
        .filter((item: IncomingMessage) => item?.role && typeof item.text === "string")
        .slice(-6)
        .map((item: IncomingMessage) => ({ role: item.role, text: item.text.slice(0, 500) }))
    : [];
  const candidates: CandidateProduct[] = Array.isArray(body.candidates)
    ? body.candidates.slice(0, 8).map((product: CandidateProduct) => ({
        id: product.id,
        title: String(product.title || "").slice(0, 160),
        brand: product.brand,
        sellingPrice: Number(product.sellingPrice),
        mrp: Number(product.mrp || 0),
        rating: Number(product.rating || 0),
        category: product.category,
        subcategory: product.subcategory,
      }))
    : [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.35,
        max_completion_tokens: 450,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are Fia, FACILE's concise ecommerce shopping assistant for Indian customers.
Respond naturally in the user's language; understand English and Roman-script Hinglish.
Never invent products, prices, ratings, stock, discounts, policies, or order status.
Only recommend products present in CANDIDATE_PRODUCTS. Product IDs must be copied exactly.
If no candidates fit, explain briefly and suggest a better search phrase.
Cart context is read-only. Never claim you changed a cart or order.
Return JSON only with this shape:
{"reply":"one concise helpful response","productIds":["exact candidate id"],"suggestedSearch":"optional concise catalog search or empty string"}`,
          },
          ...history.map((item) => ({ role: item.role, content: item.text })),
          {
            role: "user",
            content: `${message}\n\nCUSTOMER_CONTEXT=${JSON.stringify({
              signedIn: Boolean(body.user?.signedIn),
              firstName: String(body.user?.firstName || "").slice(0, 60),
              cartItemCount: Number(body.cart?.itemCount || 0),
              cartTotalInr: Number(body.cart?.total || 0),
            })}\nCANDIDATE_PRODUCTS=${JSON.stringify(candidates)}`,
          },
        ],
      }),
    });

    const groqBody = await groqResponse.json().catch(() => null);
    if (!groqResponse.ok) {
      console.error("Groq chat request failed:", groqResponse.status);
      return NextResponse.json({ error: "AI assistant is temporarily unavailable." }, { status: 502 });
    }
    const content = groqBody?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? safeJson(content) : null;
    if (!parsed || typeof parsed.reply !== "string") {
      return NextResponse.json({ error: "AI assistant returned an invalid response." }, { status: 502 });
    }

    const allowedIds = new Set(candidates.map((product) => String(product.id)));
    const productIds = Array.isArray(parsed.productIds)
      ? parsed.productIds.map(String).filter((id: string) => allowedIds.has(id)).slice(0, 3)
      : [];
    return NextResponse.json({
      reply: parsed.reply.slice(0, 900),
      productIds,
      suggestedSearch: typeof parsed.suggestedSearch === "string" ? parsed.suggestedSearch.slice(0, 120) : "",
    });
  } catch (error) {
    console.error("FACILE AI chat failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "AI assistant is temporarily unavailable." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
