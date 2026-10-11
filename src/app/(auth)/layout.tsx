import type { Metadata } from "next";

export const metadata: Metadata = {
  // Auth pages have no search value and shouldn't compete with marketing pages.
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      {/* The wordmark now lives in the site header, which wraps every page. */}
      <div className="grid w-full max-w-md gap-6">{children}</div>
    </main>
  );
}
