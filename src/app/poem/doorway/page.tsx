import Link from "next/link";
import PageShell from "@/components/journal/PageShell";
import PoemBody from "@/components/journal/PoemBody";

const poem = {
  id: "doorway",
  title: "Doorway",
  content: `I stand before a doorway,
its frame thin as a whisper,
casting shadows that stretch
like questions across the floor.

On the other side, a light shivers,
soft and trembling,
inviting, yet uncertain—
a promise I am not sure I deserve.

Each step forward feels like leaving
a piece of myself behind,
every heartbeat a key,
every breath a hinge swinging open.

The air smells of forgotten mornings,
of laughter trapped in corners,
of dreams I once carried
but tucked too deep into pockets of fear.

I hesitate, fingers brushing the wood,
tracing lines that tell stories
older than I am,
echoes of choices made
and choices never dared.

And yet, the doorway waits,
patient as the ocean,
silent as snowfall,
asking nothing, offering everything.

I close my eyes.
I step.
And the world unfolds
not in grand gestures,
but in the soft unraveling of light
between one moment and the next.`,
};

export default function DoorwayPoem() {
  return (
    <PageShell parent="/entries">
      <article>
        <h1 className="poem-title">{poem.title}</h1>
        <PoemBody content={poem.content} />

        <div className="poem-actions" aria-hidden="true" />

        <nav className="poem-nav" aria-label="poem navigation">
          <span aria-hidden="true" />
          <Link href="/entries" className="poem-nav-all">
            all entries
          </Link>
          <span aria-hidden="true" />
        </nav>
      </article>
    </PageShell>
  );
}
