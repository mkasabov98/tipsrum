/** Standard width, gutters and heading for a content page. */
export function PageShell({
  title,
  lead,
  children,
  width = "prose",
}: {
  title?: string;
  lead?: string;
  children: React.ReactNode;
  width?: "prose" | "wide";
}) {
  return (
    <main className="flex-1 px-4 py-10 sm:py-14">
      <div
        className={
          width === "wide"
            ? "mx-auto w-full max-w-6xl"
            : "mx-auto w-full max-w-3xl"
        }
      >
        {title && (
          <header className="mb-8 grid gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {lead && <p className="text-muted-foreground text-lg">{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}
