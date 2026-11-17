import Link from "next/link";

export default function PoemNotFound() {
  return (
    <main className="page-shell">
      <h1 className="page-title">this verse doesn’t exist…</h1>
      <p className="page-intro">
        the poem you’re looking for may have been renamed, or it was never here.
      </p>
      <div className="not-found-links">
        <Link href="/entries">all entries</Link>
        <Link href="/home">home</Link>
      </div>
    </main>
  );
}
