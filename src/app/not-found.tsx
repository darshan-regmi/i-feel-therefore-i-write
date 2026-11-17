import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <h1 className="page-title">this verse doesn’t exist…</h1>
      <p className="page-intro">
        this page doesn’t exist — or it slipped between the lines of a poem
        never written.
      </p>
      <div className="not-found-links">
        <Link href="/entries">all entries</Link>
        <Link href="/home">home</Link>
      </div>
    </main>
  );
}
