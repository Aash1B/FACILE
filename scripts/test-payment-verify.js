/**
 * test-payment-verify.js
 *
 * Tests the full payment verification flow without going through the UI:
 *   1. Creates a Razorpay order via your backend (/payments/create-order)
 *   2. Simulates a Razorpay payment_id (as Razorpay would return)
 *   3. Computes the HMAC-SHA256 signature using the same key secret
 *   4. Calls POST /payments/verify and prints the result
 *   5. Tests the invalid-signature case (should return HTTP 400)
 *
 * Usage:
 *   node test-payment-verify.js
 *
 * Requires: node >= 18 (fetch built-in), or: npm install node-fetch
 */

const crypto = require("crypto");

// ── Config ────────────────────────────────────────────────────────────────────
const PAYMENT_BASE_URL   = "http://localhost:8084";   // direct to Spring Boot
const RAZORPAY_KEY_SECRET = "RjhdLMfO2knpg2ZV88emKilx"; // must match application.properties
const TEST_AMOUNT         = 500;  // ₹500 test order
// ─────────────────────────────────────────────────────────────────────────────

function computeSignature(orderId, paymentId, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");
}

async function run() {
  console.log("\n════════════════════════════════════════════════════");
  console.log(" FACILE Payment Verification Test");
  console.log("════════════════════════════════════════════════════\n");

  // ── Step 1: Create a real Razorpay order ─────────────────────────────────
  console.log(`[1] Creating Razorpay order for ₹${TEST_AMOUNT}...`);
  let orderId;
  try {
    const res = await fetch(
      `${PAYMENT_BASE_URL}/payments/create-order?amount=${TEST_AMOUNT}`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const order = await res.json();
    orderId = order.id;
    console.log(`    ✅ Order created:  ${orderId}`);
    console.log(`    Amount (paise):    ${order.amount}`);
    console.log(`    Currency:          ${order.currency}`);
  } catch (err) {
    console.error("    ❌ Failed to create order:", err.message);
    console.error("    → Is payment-notification-service running on port 8084?");
    process.exit(1);
  }

  // ── Step 2: Simulate a Razorpay payment_id ───────────────────────────────
  // In production this comes from Razorpay's client-side handler.
  // For testing we simulate it — the signature math is what matters.
  const simulatedPaymentId = `pay_test_${Date.now()}`;
  console.log(`\n[2] Simulated payment_id: ${simulatedPaymentId}`);

  // ── Step 3: Compute valid HMAC-SHA256 signature ───────────────────────────
  const validSignature = computeSignature(orderId, simulatedPaymentId, RAZORPAY_KEY_SECRET);
  console.log(`\n[3] Computed HMAC-SHA256 signature:`);
  console.log(`    ${validSignature}`);

  // ── Step 4: POST /payments/verify with VALID signature ────────────────────
  console.log("\n[4] Testing VALID signature → expect HTTP 200...");
  try {
    const res = await fetch(`${PAYMENT_BASE_URL}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id:   orderId,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature:  validSignature,
        userId:              "test@facile.com",
        amount:              TEST_AMOUNT,
        currency:            "INR",
      }),
    });

    const body = await res.json();
    if (res.ok && body.success) {
      console.log(`    ✅ PASS — HTTP ${res.status}`);
      console.log(`    DB record ID:  ${body.paymentRecordId}`);
      console.log(`    Message:       ${body.message}`);
    } else {
      console.error(`    ❌ FAIL — HTTP ${res.status}`, body);
    }
  } catch (err) {
    console.error("    ❌ Network error:", err.message);
  }

  // ── Step 5: POST /payments/verify with INVALID signature ──────────────────
  console.log("\n[5] Testing INVALID signature → expect HTTP 400...");
  try {
    const res = await fetch(`${PAYMENT_BASE_URL}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id:   orderId,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature:  "this_is_a_tampered_signature_that_should_fail",
        userId:              "attacker@evil.com",
        amount:              TEST_AMOUNT,
        currency:            "INR",
      }),
    });

    const body = await res.json();
    if (res.status === 400 && !body.success) {
      console.log(`    ✅ PASS — HTTP ${res.status} (correctly rejected)`);
      console.log(`    Message:  ${body.message}`);
    } else {
      console.error(`    ❌ FAIL — should have returned 400, got HTTP ${res.status}`, body);
    }
  } catch (err) {
    console.error("    ❌ Network error:", err.message);
  }

  console.log("\n════════════════════════════════════════════════════");
  console.log(" Done. Check your PostgreSQL 'payments' table:");
  console.log("   SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;");
  console.log("════════════════════════════════════════════════════\n");
}

run();
