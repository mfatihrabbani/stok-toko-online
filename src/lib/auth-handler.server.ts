import { ZodError } from "zod";
import { auth } from "@/lib/auth.server";
import { ApiError, readJson } from "@/lib/api.server";
import { env } from "@/lib/env.server";
import { signInSchema, signUpSchema } from "@/validators/auth";

export async function handleAuthRequest(request: Request) {
  const path = new URL(request.url).pathname;
  if (
    request.method === "POST" &&
    ["/api/auth/sign-up/email", "/api/auth/sign-in/email"].includes(path)
  ) {
    try {
      if (
        request.headers.get("origin") !== new URL(env.BETTER_AUTH_URL).origin ||
        request.headers.get("sec-fetch-site") === "cross-site"
      )
        throw new ApiError(
          403,
          "FORBIDDEN_ORIGIN",
          "Gunakan form pada aplikasi toko.",
        );
      const body = await readJson(request.clone());
      const record =
        body && typeof body === "object" && !Array.isArray(body)
          ? (body as Record<string, unknown>)
          : {};
      const credentials = { email: record.email, password: record.password };
      const input = path.endsWith("sign-up/email")
        ? signUpSchema.parse({ ...credentials, name: record.name })
        : signInSchema.parse(credentials);
      const headers = new Headers(request.headers);
      headers.delete("content-length");
      request = new Request(request.url, {
        method: request.method,
        headers,
        body: JSON.stringify({ ...record, ...input }),
      });
    } catch (error) {
      if (error instanceof ApiError)
        return Response.json(
          { error: { code: error.code, message: error.message } },
          {
            status: error.status,
            headers: { "Cache-Control": "private, no-store" },
          },
        );
      if (error instanceof ZodError)
        return Response.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Periksa data akun toko.",
              details: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
          },
          { status: 422, headers: { "Cache-Control": "private, no-store" } },
        );
      throw error;
    }
  }
  const response = await auth.handler(request);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
