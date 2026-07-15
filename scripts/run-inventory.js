/**
 * run-inventory.js
 *
 * Auto-detects the correct path for product-inventory-service regardless of
 * whether the folder is nested (product-inventory-service/product-inventory-service/)
 * or flat (product-inventory-service/).
 *
 * This happens when someone extracts a zip that creates a folder inside itself.
 */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const JAVA_HOME = "C:\\Program Files\\Microsoft\\jdk-21.0.11.10-hotspot";

// Detect which structure exists
const nestedPath = path.resolve("product-inventory-service", "product-inventory-service");
const flatPath   = path.resolve("product-inventory-service");

let serviceDir;
if (fs.existsSync(path.join(nestedPath, "mvnw.cmd"))) {
  serviceDir = nestedPath;
  console.log("[inventory] Detected nested folder structure → using:", serviceDir);
} else if (fs.existsSync(path.join(flatPath, "mvnw.cmd"))) {
  serviceDir = flatPath;
  console.log("[inventory] Detected flat folder structure → using:", serviceDir);
} else {
  console.error("[inventory] ERROR: Could not find mvnw.cmd in either:");
  console.error("  -", nestedPath);
  console.error("  -", flatPath);
  process.exit(1);
}

// Spawn Maven with the correct working directory
const mvn = spawn("mvnw.cmd", ["spring-boot:run"], {
  cwd: serviceDir,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, JAVA_HOME },
});

mvn.on("close", (code) => {
  process.exit(code ?? 0);
});
