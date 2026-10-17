import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { redirectTargetFromSearchParams } from "@/lib/redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Регистрация | Tipsrum" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo = redirectTargetFromSearchParams(params);
  if (await getSession()) redirect(redirectTo);

  // A plain sign-up is the free funnel, so it ends on the free welcome page.
  const explicit = params.redirect ?? params.arm_redirect;
  return (
    <RegisterForm redirectTo={explicit ? redirectTo : "/free_thank_you"} />
  );
}
