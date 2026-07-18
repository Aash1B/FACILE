const net = require("net");
const { spawn } = require("child_process");

const requiredPorts = [8081, 8082, 8083, 8084];
const deadline = Date.now() + 180_000;

function canConnect(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (ready) => {
      socket.destroy();
      resolve(ready);
    };
    socket.setTimeout(1_000);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function waitForBackends() {
  while (Date.now() < deadline) {
    const states = await Promise.all(requiredPorts.map(canConnect));
    if (states.every(Boolean)) return;
    const pending = requiredPorts.filter((_, index) => !states[index]);
    console.log(`[frontend] Waiting for backend ports: ${pending.join(", ")}`);
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  throw new Error("Backend services did not become ready within 3 minutes.");
}

waitForBackends()
  .then(() => {
    console.log("[frontend] All backend services are ready. Starting Next.js.");
    const command = process.platform === "win32" ? "npx.cmd" : "npx";
    const frontend = spawn(command, ["next", "dev", "FRONTEND", "--webpack"], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    frontend.on("exit", (code) => process.exit(code ?? 0));
  })
  .catch((error) => {
    console.error(`[frontend] ${error.message}`);
    process.exit(1);
  });
