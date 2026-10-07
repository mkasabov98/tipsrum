import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { redirectTargetFromSearchParams } from "@/lib/redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Вход | Tipsrum" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const redirectTo = redirectTargetFromSearchParams(await searchParams);
  if (await getSession()) redirect(redirectTo);

  return <LoginForm redirectTo={redirectTo} />;
}
