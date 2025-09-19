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

## Presentations

Add entries to `data/presentations.json` to manage the `/presentations` page.

Each item supports:

-   `title` (string)
-   `description` (string)
-   `icon` (string, iconify id)
-   `color` (string, hex)
-   `url` (string, canonical link, optional; prefer `contentUrl`)
-   `contentUrl` (string, optional; link do conteúdo para o botão principal)
-   `githubUrl` (string, opcional; link do repositório)
-   `date` (string, optional)
-   `location` (string, optional)
-   `preview` (optional object):

    -   Google Slides:

            ```json
            {
             "type": "google-slides",
             "slidesEmbedUrl": "https://docs.google.com/presentation/.../embed?start=false&loop=false&delayms=3000"
            }
            ```

    -   YouTube:

            ```json
            { "type": "youtube", "youtubeId": "Y57gUwb1v3g" }
            ```

    -   GitHub README snippet (rendered with MDX styles):

            ```json
            { "type": "github-readme", "readmeMarkdown": "# Title\nSome markdown..." }
            ```

Notes:

-   We render README markdown at build time using `next-mdx-remote` with the same blog remark/rehype plugins.
-   If you want to fetch README from GitHub dynamically, wire a serverless API or fetch during `getStaticProps` with a token and put the markdown into `readmeMarkdown`.

## Internationalization (i18n)

Built-in minimal i18n (no external deps):

-   Locale files: `locales/pt.json`, `locales/en.json`
-   Provider: `~/lib/i18n` wraps the app in `pages/_app.tsx`
-   Hook usage:

```ts
import { useI18n } from '~/lib/i18n';

const { t, locale, setLocale } = useI18n();

return <h1>{t('home.title')}</h1>;
```

-   Navbar settings menu has a PT/EN language switcher
-   Selection persists in `localStorage` and updates `<html lang>`

SEO titles per page/layout should use keys in locale files:

-   Home/Default: uses `seo.title` and `seo.description` via `useSeoProps`
-   Projects: `projects.seo_title`
-   Timeline: `timeline.seo_title`
-   Talks: `talks.seo_title`
-   Presentations: `presentations.seo_title`
-   Links: `links.seo_title`
-   Blog layout: `blog.seo_title`
-   Error layout: `error.seo_title`

Add or change strings in the JSONs and reference via `t('path.to.key')`.

## YAML-driven redirects for /links/\*

Declarative redirects live in `data/redirects.yaml` and are versioned.

-   Example entry:

```yaml
redirects:
    - source: /links/linkedin
      destination: https://www.linkedin.com/in/gdantasdev
```

-   At build/export, `scripts/sync-redirects.ts` merges all `/links/*` entries into `vercel.json` `redirects`, preserving existing non-`/links/*` entries.
-   Static SSG pages are also generated at `pages/links/[slug].tsx` so exports work even without Vercel config, using meta refresh + JS redirect.

Usage:

-   Add or edit entries in `data/redirects.yaml`
-   Run:

```zsh
yarn build
# or
yarn export
```

This will regenerate `vercel.json` and the static pages under `/links/*`.
