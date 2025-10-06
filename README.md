# 🌿 i feel, therefore i write  
_a collection of verses and emotions — raw, real, human._

> “for anyone who’s ever felt too much, or not enough.”

**i feel, therefore i write** is a minimalist poetry-sharing web app built with Next.js, celebrating vulnerability, creativity, and quiet fire. It offers a clean, soulful space to post and read personal poems — where design meets emotion.

---

# ✨ Features
- 🖋️ Read original poems in a quiet, thoughtful space — where words breathe.
- 🎨 Soft, serif-centered design that feels more like a journal than a website.
- ⚡ Fast and fluid — built with Next.js for a seamless, distraction-free flow.
- 🧠 Typed with care — structured in TypeScript for clarity and future growth.

---

## 🛠 Tech Stack

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ESLint](https://eslint.org/)
- [Turbopack](https://turbo.build/pack)

---

## 📦 Getting Started

```bash
# Clone the repo
git clone https://github.com/darshan-regmi/i-feel-therefore-i-write.git

# Navigate into the directory
cd i-feel-therefore-i-write

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔁 Automatic Notion → Firestore Sync

If you deploy on Cloudflare (Pages + Functions):

- Enable a Cron Trigger in Cloudflare Dashboard to call your site’s `/api/sync` endpoint on a schedule (e.g., hourly: `0 * * * *`).
- Alternatively, create a minimal Cloudflare Worker that fetches your Pages URL `/api/sync` on the cron schedule.
- Ensure `NOTION_API_KEY` is set in your Cloudflare project environment variables.

Example Worker (optional):

```javascript
export default {
  async scheduled(controller, env, ctx) {
    await fetch(env.SITE_URL + "/api/sync");
  }
};
```

# 📌 Project Structure (App Router)
```bash
/app
    ├── favicon.ico
    ├── globals.css     # Global styles
    ├── layout.tsx      # Main layout component
    ├── page.tsx        # Home page
    └── poem
        └── page.tsx   # Poem detail page
```
---

# 💭 Inspiration

This project is a digital reflection of deep feeling and artistic expression. It’s built for poets, feelers, and quiet creators who believe that vulnerability is strength.

> “I am made of quiet fire.”



# 🧑‍💻 Author

Darshan Regmi – [@wordsbydarshan](https://instagram.com/wordsbydarshan)
Poet | Developer | Human
_“I code as I write — with heart.”_

---

# 🪶 License

### This project is not open-source.

All code, design, and written content (including poems) are the personal and original work of Darshan Regmi (@wordsbydarshan).
Unauthorized use, distribution, or reproduction of any part of this project is strictly prohibited.

If you’d like to collaborate, showcase, or discuss the project — feel free to reach out.

### 📬  DM via [Instagram](https://instagram.com/wordsbydarshan)
