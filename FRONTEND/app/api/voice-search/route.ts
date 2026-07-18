import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function runWhisper(executable: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(executable, args, { windowsHide: true });
    let errorOutput = "";
    const timeout = setTimeout(() => {
      process.kill();
      reject(new Error("Local transcription timed out."));
    }, 60_000);

    process.stderr.on("data", (chunk) => {
      errorOutput += String(chunk);
    });
    process.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    process.on("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve();
      else reject(new Error(errorOutput.trim() || `Whisper exited with code ${code}.`));
    });
  });
}

export async function POST(request: Request) {
  const toolRoot = path.join(process.cwd(), ".facile-tools", "whisper");
  const executable = path.join(toolRoot, "bin", "whisper-cli.exe");
  const smallModel = path.join(toolRoot, "models", "ggml-small.bin");
  const baseModel = path.join(toolRoot, "models", "ggml-base.bin");
  const model = existsSync(smallModel) ? smallModel : baseModel;
  if (!existsSync(executable) || !existsSync(model)) {
    return NextResponse.json(
      { error: "Local voice search is not installed. Run npm run setup:voice, then restart FACILE." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  if (!(audio instanceof File) || audio.size === 0 || audio.size > 12_000_000) {
    return NextResponse.json({ error: "A valid voice recording is required." }, { status: 400 });
  }

  const workDirectory = path.join(tmpdir(), `facile-voice-${randomUUID()}`);
  const audioPath = path.join(workDirectory, "search.wav");
  const outputPath = path.join(workDirectory, "transcript");
  await mkdir(workDirectory, { recursive: true });

  try {
    await writeFile(audioPath, Buffer.from(await audio.arrayBuffer()));
    await runWhisper(executable, [
      "-m", model,
      "-f", audioPath,
      // Detect English/Hindi automatically, then translate Hindi portions to
      // searchable English text instead of returning Devanagari or fake French.
      "-l", "auto",
      "-tr",
      "--prompt", "FACILE ecommerce product search. Common requests: show me shoes, kurti under 1000, skincare products, phone cover, jewellery, electronics.",
      "-nt",
      "-otxt",
      "-of", outputPath,
    ]);
    const transcript = (await readFile(`${outputPath}.txt`, "utf8"))
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!transcript) {
      return NextResponse.json({ error: "No speech was detected. Please speak clearly and try again." }, { status: 422 });
    }
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Local voice transcription failed:", error);
    return NextResponse.json({ error: "Local transcription failed. Please try again." }, { status: 500 });
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
}
