export default function PoemBody({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);

  return (
    <div className="poem-body">
      {lines.map((line, index) =>
        line.trim().length === 0 ? (
          <div key={index} className="poem-spacer" aria-hidden="true" />
        ) : (
          <p key={index}>{line}</p>
        )
      )}
    </div>
  );
}
