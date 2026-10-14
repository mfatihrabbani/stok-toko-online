import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { appendFileSync } from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { root, loadEnvironment, availablePostgresPort } from "./lib.mjs";

async function choosePort(preferred) {
  return new Promise((accept) => {
    const server = createServer();
    server.unref();
    server.once("error", async () => accept(await availablePostgresPort()));
    server.listen({ host: "127.0.0.1", port: preferred }, () =>
      server.close(() => accept(preferred)),
    );
  });
}
try {
  await loadEnvironment();
  if (
    process.env.SMTP_HOST &&
    !["127.0.0.1", "localhost"].includes(process.env.SMTP_HOST)
  ) {
    console.log(
      "Using supplied SMTP settings. Local mail service is not required.",
    );
  } else {
    const action = process.argv[2] || "up";
    if (!["up", "down", "status"].includes(action))
      throw new Error("Use mail:up, mail:down, or mail:status.");
    const additions = {};
    if (action === "up") {
      if (!process.env.SMTP_HOST) additions.SMTP_HOST = "127.0.0.1";
      if (!process.env.SMTP_PORT)
        additions.SMTP_PORT = String(await choosePort(1025));
      if (!process.env.MAILPIT_WEB_PORT)
        additions.MAILPIT_WEB_PORT = String(await choosePort(8025));
      if (!process.env.MAILPIT_PROJECT_NAME)
        additions.MAILPIT_PROJECT_NAME = `stok-mail-${randomBytes(6).toString("hex")}`;
      if (!process.env.LOCAL_MAIL_INBOX_URL)
        additions.LOCAL_MAIL_INBOX_URL = `http://localhost:${process.env.MAILPIT_WEB_PORT || additions.MAILPIT_WEB_PORT}`;
      if (Object.keys(additions).length) {
        const lines = Object.entries(additions)
          .map(([key, value]) => `${key}="${value}"`)
          .join("\n");
        appendFileSync(resolve(root, ".env.local"), `\n${lines}\n`, {
          mode: 0o600,
        });
        Object.assign(process.env, additions);
      }
    }
    if (!process.env.MAILPIT_PROJECT_NAME)
      throw new Error("Run npm run mail:up first.");
    const args =
      action === "up"
        ? ["up", "-d"]
        : action === "status"
          ? ["ps", "--all"]
          : ["down"];
    const result = spawnSync(
      "docker",
      [
        "compose",
        "-p",
        process.env.MAILPIT_PROJECT_NAME,
        "-f",
        "compose.mail.yaml",
        ...args,
      ],
      { cwd: root, env: process.env, stdio: "inherit" },
    );
    if (result.error || result.status !== 0)
      throw new Error(
        "Local mail service could not start. Check the local container engine and retry npm run mail:up.",
      );
    if (action === "up") {
      let ready = false;
      for (let attempt = 0; attempt < 20; attempt++) {
        try {
          ready = (
            await fetch(`${process.env.LOCAL_MAIL_INBOX_URL}/readyz`, {
              signal: AbortSignal.timeout(1000),
            })
          ).ok;
        } catch {
          /* startup retry */
        }
        if (ready) break;
        await new Promise((accept) => setTimeout(accept, 250));
      }
      if (!ready)
        throw new Error(
          "Local mail inbox has not responded yet. Retry npm run mail:up.",
        );
      console.log(`Local email inbox: ${process.env.LOCAL_MAIL_INBOX_URL}`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
