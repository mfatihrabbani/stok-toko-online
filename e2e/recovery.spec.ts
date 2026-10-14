import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { expect, test } from "@playwright/test";

test("recovery sends a local email, consumes its token once and revokes old sessions", async ({
  request,
}) => {
  const headers = { Origin: "http://localhost:3101" };
  const inbox = process.env.STARTER_TEST_MAIL_INBOX_URL;
  expect(Boolean(inbox)).toBe(true);
  const email = `recovery-${randomUUID()}@example.com`;
  const signup = {
    name: "Recovery Builder",
    email,
    password: "Recovery-old-password-123!",
  };
  let account = await request.post("/api/auth/sign-up/email", {
    headers,
    data: signup,
  });
  if (account.status() === 429) {
    await delay((Number(account.headers()["retry-after"] || 10) + 0.1) * 1000);
    account = await request.post("/api/auth/sign-up/email", {
      headers,
      data: signup,
    });
  }
  expect(account.status()).toBe(200);
  expect(
    (
      await request.post("/api/auth/request-password-reset", {
        headers,
        data: { email, redirectTo: `${headers.Origin}/reset-password` },
      })
    ).status(),
  ).toBe(200);
  let messageId = "";
  await expect
    .poll(
      async () => {
        const listing = await (
          await fetch(
            `${inbox}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
          )
        ).json();
        messageId = listing.messages?.[0]?.ID || "";
        return Boolean(messageId);
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  const message = await (
    await fetch(`${inbox}/api/v1/message/${messageId}`)
  ).json();
  const url = String(message.Text).match(/https?:\/\/[^\s]+/)?.[0];
  expect(Boolean(url)).toBe(true);
  const resetPage = await request.get(url!);
  const token = new URL(resetPage.url()).searchParams.get("token");
  expect(Boolean(token)).toBe(true);
  const reset = { token, newPassword: "Recovery-new-password-456!" };
  expect(
    (
      await request.post("/api/auth/reset-password", { headers, data: reset })
    ).status(),
  ).toBe(200);
  expect((await request.get("/api/products")).status()).toBe(401);
  expect(
    (
      await request.post("/api/auth/reset-password", { headers, data: reset })
    ).status(),
  ).toBeGreaterThanOrEqual(400);
  expect(
    (
      await request.post("/api/auth/sign-in/email", {
        headers,
        data: { email, password: signup.password },
      })
    ).status(),
  ).toBeGreaterThanOrEqual(400);
  expect(
    (
      await request.post("/api/auth/sign-in/email", {
        headers,
        data: { email, password: reset.newPassword },
      })
    ).status(),
  ).toBe(200);
});
