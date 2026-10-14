import { createFileRoute } from "@tanstack/react-router";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { token?: string; error?: string } => ({
    token:
      typeof search.token === "string" ? search.token.slice(0, 512) : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({ meta: [{ title: "Kata sandi baru | stok." }] }),
  component: ResetPage,
});
function ResetPage() {
  const search = Route.useSearch();
  return (
    <PasswordRecoveryForm
      mode="reset"
      token={search.token}
      invalidToken={Boolean(search.error)}
    />
  );
}
