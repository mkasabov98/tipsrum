import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  // Auth pages have no search value and shouldn't compete with marketing pages.
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-sm gap-6">
        <Link
          href="/"
          className="text-primary text-center text-sm font-semibold tracking-widest uppercase"
        >
          Tipsrum
        </Link>
        {children}
      </div>
    </main>
  );
}
