/**
 * run-inventory.js
 *
 * Auto-detects the correct path for product-inventory-service regardless of
 * whether the folder is nested (product-inventory-service/product-inventory-service/)
 * or flat (product-inventory-service/).
 *
 * This happens when someone extracts a zip that creates a folder inside itself.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// ── JAVA_HOME resolution ───────────────────────────────────────────────────
// Use env var if set and valid, otherwise auto-detect from common Windows paths.
const COMMON_JDK_ROOTS = [
  "C:\\Program Files\\Java",
  "C:\\Program Files\\Eclipse Adoptium",
  "C:\\Program Files\\Microsoft",
  "C:\\Program Files\\Amazon Corretto",
];

function findJavaHome() {
  // 1. Honour explicit env var if it actually contains java.exe
  const envJava = process.env.JAVA_HOME;
  if (envJava && fs.existsSync(path.join(envJava, "bin", "java.exe"))) {
    return envJava;
  }

  // 2. Auto-scan common install roots
  for (const root of COMMON_JDK_ROOTS) {
    if (!fs.existsSync(root)) continue;
    const entries = fs.readdirSync(root);
    // Sort descending so the newest JDK wins (e.g. jdk-21 before jdk-17)
    entries.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const entry of entries) {
      const candidate = path.join(root, entry);
      if (fs.existsSync(path.join(candidate, "bin", "java.exe"))) {
        return candidate;
      }
    }
  }
  return null;
}

const javaHome = findJavaHome();
if (!javaHome) {
  console.error("[inventory] JAVA_HOME could not be determined automatically.");
  console.error("[inventory] Please set JAVA_HOME to your JDK install directory and retry.");
  console.error("[inventory] Example: set JAVA_HOME=C:\\Program Files\\Java\\jdk-21.0.11");
  process.exit(1);
}

if (!process.env.JAVA_HOME) {
  console.log("[inventory] JAVA_HOME auto-detected:", javaHome);
  process.env.JAVA_HOME = javaHome;
}

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
  env: process.env,
});

mvn.on("close", (code) => {
  process.exit(code ?? 0);
});
