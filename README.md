# 🌿 i feel, therefore i write

_a collection of verses and emotions — raw, real, human._

> "for anyone who's ever felt too much, or not enough."

A minimalist poetry-sharing web app built with Next.js. Poems live in a Notion database, sync daily to Firestore (which tracks likes), and render through a clean, serif-centered reading experience.

---

## ✨ Features

- 🖋️ Read original poems in a quiet, thoughtful space — where words breathe.
- ❤️ Per-user likes with anonymous Firebase Auth — no signup needed.
- 🔍 Fuzzy search across every poem.
- ⏳ Infinite scroll on the poem index (100 at a time).
- 🎨 Soft, serif-centered design that feels more like a journal than a website.
- ⚡ Edge-rendered with aggressive caching for fast cold loads.

---

## 🛠 Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router, edge runtime)
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **[Notion](https://developers.notion.com/)** — source of truth for poem content
- **[Firebase Auth + Firestore](https://firebase.google.com/)** — likes + anonymous auth
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — hosting (via `@cloudflare/next-on-pages`)
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — daily cron that triggers `/api/sync`

---

## 🏗️ Architecture

```
   ┌─────────┐    cron (daily)     ┌──────────────┐
   │ Worker  │ ───────────────────▶│ /api/sync    │
   └─────────┘                     │ (edge)       │
                                   └──────┬───────┘
                                          │
                            reads         │       writes
                                          ▼
                            ┌──────────┐  ┌────────────┐
                            │ Notion   │  │ Firestore  │
                            │ (poems)  │  │ poems +    │
                            └──────────┘  │ likes      │
                                          └────────────┘
                                                ▲
                                  reads & toggles│
                                          ┌─────┴────┐
                                          │ Browser  │
                                          └──────────┘
```

- **Poem content** is authored in Notion (status: `Published`). Notion is the only source of truth for titles and bodies.
- `/api/sync` upserts every published Notion poem into Firestore. It runs daily via a Cloudflare Worker cron and can also be triggered manually.
- **Likes** live entirely in Firestore. The `poems` collection stores a `likes` counter per poem; the `likes` collection holds one `{poemId}_{userId}` doc per like.
- The `/poem` page server-prefetches all like counts in one batched call and shares the user's liked-poem set across every `LikeButton` via React Context — so the UI hydrates without N round-trips.

---

## 📦 Getting started

```bash
git clone https://github.com/darshan-regmi/i-feel-therefore-i-write.git
cd i-feel-therefore-i-write
npm install

cp .env.example .env.local   # fill in real values (see below)

npm run dev
```

Open <http://localhost:3000>.

### Environment variables

Every required variable is documented in [`.env.example`](.env.example). Briefly:

| Group                                                                  | Purpose                                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                 | Canonical URL used in metadata, sitemap, OG, JSON-LD                        |
| `NOTION_API_KEY`, `NOTION_DATABASE_ID`                                 | Server-side Notion integration                                              |
| `NEXT_PUBLIC_FIREBASE_*`                                               | Firebase Web SDK config (browser)                                           |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Service-account credentials used by `/api/sync` to write Firestore via REST |
| `SYNC_SECRET`                                                          | Shared between `/api/sync` and the Cloudflare cron worker                   |
| `REVALIDATE_SECRET`                                                    | Gates `POST /api/revalidate` for cache busts                                |

`/api/sync` runs on the edge runtime, so it talks to Firestore via REST + a Web-Crypto-signed service-account JWT (no `firebase-admin`).

---

## 🚀 Deployment (Cloudflare Pages + Worker cron)

### Pages (the Next.js app)

1. Create a Cloudflare Pages project pointed at this repo.
2. Build command: `npx @cloudflare/next-on-pages@1`. Output dir: `.vercel/output/static`.
3. In the Pages project, add every env var from `.env.example` (Production and Preview).

### Cron worker (the daily sync trigger)

The worker source lives in [`cloudflare-worker/worker.ts`](cloudflare-worker/worker.ts) with config in [`wrangler.toml`](wrangler.toml).

```bash
# In the project root
wrangler secret put SYNC_SECRET   # paste the same value as in Pages env
wrangler deploy
```

The worker hits `${SITE_URL}/api/sync` once a day (00:00 UTC) with the `x-sync-secret` header. `SITE_URL` is a plain var in `wrangler.toml` — update it to your domain before deploying.

### Firestore security rules

```bash
firebase deploy --only firestore:rules
```

Rules in [`firestore.rules`](firestore.rules):

- `poems`: world-readable. Clients can only increment the `likes` integer. All creates/deletes are admin-only (the sync route bypasses rules via service-account auth).
- `likes`: each `{poemId}_{userId}` doc is owned by `userId`. Users can create/delete their own, read their own. No updates allowed.

### Triggering a manual sync

```bash
curl -H "x-sync-secret: $SYNC_SECRET" https://your-domain/api/sync
```

Response includes `{ added, updated, unchanged }` counts and bust the `poems` + `poem-likes` cache tags on success.

### Busting caches manually

```bash
# Everything (poems + like counts + ISR paths)
curl "https://your-domain/api/revalidate?secret=$REVALIDATE_SECRET"

# Just the like counts
curl "https://your-domain/api/revalidate?secret=$REVALIDATE_SECRET&tag=poem-likes"
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── poem/[id]/route.ts      # JSON read by client (rarely needed)
│   │   ├── revalidate/route.ts     # path + tag invalidation
│   │   └── sync/route.ts           # Notion → Firestore upsert
│   ├── poem/
│   │   ├── [id]/                   # individual poem page + OG images
│   │   ├── doorway/                # password gate before /poem
│   │   └── page.tsx                # main index with infinite scroll
│   ├── liked-poem/                 # user's likes (auth-required)
│   ├── about-the-author/
│   ├── layout.tsx                  # root layout, metadata, JSON-LD
│   ├── page.tsx                    # landing
│   └── sitemap.ts                  # dynamic sitemap from Notion
├── components/
│   ├── LikedPoemsProvider.tsx      # context: one auth + one Firestore query
│   ├── LikeButton.tsx              # consumes context, server-seeded counts
│   ├── PoemClient.tsx              # search + infinite scroll
│   └── SearchBar.tsx               # Fuse.js search
└── lib/
    ├── firestoreRest.ts            # edge Firestore client (OAuth2 + REST)
    ├── notion.ts                   # cached Notion fetches
    ├── poemLikes.ts                # server-side like-count prefetch
    ├── likes.ts                    # client Firestore helpers
    ├── firebase.ts                 # Firebase Web SDK init
    └── site.ts                     # canonical SITE_URL

cloudflare-worker/
└── worker.ts                       # daily cron → /api/sync
```

---

## 💭 Inspiration

A digital reflection of deep feeling and artistic expression. Built for poets, feelers, and quiet creators who believe that vulnerability is strength.

> "I am made of quiet fire."

---

## 🧑‍💻 Author

Darshan Regmi — [@bydarshanregmi](https://instagram.com/bydarshanregmi)
Poet · Developer · Human
_"I code as I write — with heart."_

---

## 🪶 License

**This project is not open-source.**

All code, design, and written content (including poems) are the personal and original work of Darshan Regmi ([@bydarshanregmi](https://instagram.com/bydarshanregmi)).
Unauthorized use, distribution, or reproduction of any part of this project is strictly prohibited.

If you'd like to collaborate, showcase, or discuss the project — feel free to reach out via [Instagram DM](https://instagram.com/bydarshanregmi).
