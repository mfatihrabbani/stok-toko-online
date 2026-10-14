import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/_auth/sign-up")({
  head: () => ({ meta: [{ title: `Daftar akun | ${siteConfig.name}` }] }),
  component: () => <AuthForm mode="sign-up" />,
});
