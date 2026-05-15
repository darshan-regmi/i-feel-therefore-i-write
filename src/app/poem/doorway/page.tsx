'use client'

import Link from 'next/link'
import LikeButton from "@/components/LikeButtonLazy";

const poem = {
  id: "doorway", // unique ID for this poem
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
between one moment and the next.`
};

export default function DoorwayPoem() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-6 sm:p-8">
      {/* Back Link */}
      <div className="flex justify-start w-full mb-8">
        <Link
          href="/poem"
          aria-label="Go back to poems"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200"
        >
          ← back to poems
        </Link>
      </div>

      <article className="w-full max-w-2xl mt-2">
        <h1 className="text-3xl sm:text-4xl font-serif text-center mb-6">{poem.title}</h1>

        <div className="p-6 sm:p-8 bg-blush rounded-2xl shadow-md text-lg sm:text-xl font-light leading-relaxed whitespace-pre-line animate-fadeIn">
          {poem.content}
          <br />
          <br />
          <LikeButton poemId={poem.id} />
        </div>
      </article>
    </main>
  )
}