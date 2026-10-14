import { createFileRoute } from "@tanstack/react-router";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
import { getRecoveryInboxFn } from "@/lib/recovery-settings";
export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({ meta: [{ title: "Lupa kata sandi | stok." }] }),
  loader: () => getRecoveryInboxFn(),
  component: RecoveryPage,
});
function RecoveryPage() {
  return (
    <PasswordRecoveryForm mode="request" inboxUrl={Route.useLoaderData()} />
  );
}
