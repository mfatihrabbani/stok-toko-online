import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";
export const getRecoveryInboxFn = createServerFn({ method: "GET" }).handler(
  () => {
    if (
      !["127.0.0.1", "localhost"].includes(env.SMTP_HOST) ||
      !env.LOCAL_MAIL_INBOX_URL
    )
      return undefined;
    const url = new URL(env.LOCAL_MAIL_INBOX_URL);
    return ["127.0.0.1", "localhost"].includes(url.hostname) &&
      !url.username &&
      !url.password
      ? url.origin
      : undefined;
  },
);
