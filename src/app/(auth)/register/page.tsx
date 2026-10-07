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
  const redirectTo = redirectTargetFromSearchParams(await searchParams);
  if (await getSession()) redirect(redirectTo);

  return <RegisterForm redirectTo={redirectTo} />;
}
