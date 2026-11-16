import Link from "next/link";
import type { ReactNode } from "react";
import BackLink from "./BackLink";

export default function PageShell({
  children,
  parent = "/home",
  header = true,
}: {
  children: ReactNode;
  parent?: string;
  header?: boolean;
}) {
  return (
    <main className="page-shell">
      {header && (
        <header className="site-header">
          <BackLink parent={parent} />
          <Link href="/home" className="site-title plain-link">
            i feel, therefore i write
          </Link>
        </header>
      )}
      {children}
    </main>
  );
}
