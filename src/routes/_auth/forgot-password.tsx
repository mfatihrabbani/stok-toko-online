import { createFileRoute } from "@tanstack/react-router";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({ meta: [{ title: "Lupa kata sandi | stok." }] }),
  component: () => <PasswordRecoveryForm mode="request" />,
});
