<div align="center">

<a target="_blank" href="https://gdantas.com.br">
    <img alt='Website' src="./public/home-print.jpeg" />
</a>

[![Website](https://img.shields.io/badge/%20%F0%9F%8F%A1%20website-0072ff.svg?longCache=true&style=for-the-badge)](https://gdantas.com.br)
[![License](https://img.shields.io/badge/-mit-red.svg?longCache=true&style=for-the-badge)](https://github.com/tdemapp/website/blob/master/LICENSE)

</div>

## 🛠 Development

Clone the repository

```zsh
git clone https://github.com/gabriel-dantas98/gdantas.io.git
```

Install dependencies

```zsh
npm install

# Or using Yarn

yarn
```

Start the development server

```zsh
npm run dev

# Or using Yarn

yarn dev
```

Build for production

```zsh
npm run build

# Or using Yarn

yarn build
```

## 📄 License

MIT © [Ben Dixon](https://github.com/gabriel-dantas98/gdantas.io/blob/main/LICENSE)

## Credits

This project is inspired by [nuro.dev](https://github.com/NuroDev/nuro.dev)

## Presentations / talks

Canonical recipe: `.agents/skills/adding-a-talk/SKILL.md` (Cursor command: `.cursor/commands/add-presentation.md`).

Add the talk to `data/presentations.json` **and** `talks.items.<slug>` in both `locales/pt.json` and `locales/en.json`, then run `yarn talks:og`. Individual pages (`/talks/<slug>`, `/en/talks/<slug>`), home cards, `/talks`, `/presentations`, sitemap and OG images all derive from that slug.

Each `presentations.json` item supports:

-   `slug` (required, kebab-case)
-   `event` (required)
-   `title` / `description` (fallback; locales win at render)
-   `icon` (iconify id) / `color` (hex)
-   `contentUrl` (canonical content link; `url` is legacy)
-   `githubUrl` (optional companion repo)
-   `date` (`YYYY-MM-DD`) / `location`
-   `preview` (optional object):
    -   Google Slides — **must** set `slidesEmbedUrl` (`.../embed?start=false&loop=false&delayms=3000`)
    -   YouTube: `{ "type": "youtube", "youtubeId": "..." }`
    -   Canva / Spotify / PDF as in existing entries

Then: `yarn i18n:check && yarn talks:check && yarn type-check && yarn build`.
