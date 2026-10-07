import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Забравена парола | Tipsrum" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
