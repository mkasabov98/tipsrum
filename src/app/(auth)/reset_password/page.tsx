import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Нова парола | Tipsrum" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Better-Auth sends users here with ?token=... or, for a bad/expired link,
  // ?error=INVALID_TOKEN. Either missing token or an error means "request a new one".
  const params = await searchParams;
  const token =
    typeof params.token === "string" && !params.error ? params.token : null;

  return <ResetPasswordForm token={token} />;
}
