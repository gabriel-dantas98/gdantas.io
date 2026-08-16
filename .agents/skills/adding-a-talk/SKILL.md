---
name: adding-a-talk
description: Add a talk, podcast, or slide deck to gdantas.com.br — presentations.json, bilingual copy, OG images, Remotion, and validation.
---

# Adding a talk

Use this when the user shares a new talk, podcast, deck, or event appearance. Do not stop at `data/presentations.json`. Source of truth for routes, cards, SEO, and OG is the slug in that file plus matching `talks.items` keys in both locales.

The Cursor command `.cursor/commands/add-presentation.md` is a thin pointer to this skill. Keep them in sync.

## Do not

- Do not add only `data/presentations.json` or only `data/talks.json`.
- Do not edit `locales/pt.json` without `locales/en.json` in the same change.
- Do not invent a new page shell. `pages/talks/[slug].tsx` and `pages/en/talks/[slug].tsx` already SSG every slug.
- Do not add `talks.home.<slug>` — leftover unused copy. Home renders the full catalogue via `getTalkSummaries()`.
- Do not add a `/go/<slug>` shortcut unless the user asked.
- Do not rename or drop existing PostHog events. `TalkCard` / talk detail already capture `talk_clicked`, `talk_card_clicked`, `presentation_played`, `presentation_src_opened`.

## Extract

From the URL and what the user said:

| Field | Where it lands |
| --- | --- |
| Official title | Google Slides / YouTube / Canva tab title, then user wording |
| Event | Short name (`Codecon Summit`, `CNCF Campinas`) |
| Date | `YYYY-MM-DD` |
| Location | `City, UF` or `Online` |
| Canonical content URL | `contentUrl` |
| Preview type | Infer from host |

Google Slides title is the deck name, not the edit URL. Event copy from the user wins over marketing fluff.

## Slug

`^[a-z0-9][a-z0-9-]{0,63}$`. Topic-kebab, unique vs existing slugs. Prefer the distinctive title (`engenharia-navegavel`) over repeating a sibling talk (`idp-portals`).

## `data/presentations.json`

Insert at the top. Keep the array newest-first by `date`. Entries without `date` stay at the end.

Google Slides:

```json
{
	"slug": "example-slug",
	"event": "Event Name",
	"title": "Event Name YYYY - Talk title",
	"icon": "feather:book",
	"color": "#hex",
	"description": "Fallback PT description (locales win at render).",
	"contentUrl": "https://docs.google.com/presentation/d/<ID>/edit?usp=sharing",
	"date": "YYYY-MM-DD",
	"location": "City, UF",
	"preview": {
		"type": "google-slides",
		"slidesEmbedUrl": "https://docs.google.com/presentation/d/<ID>/embed?start=false&loop=false&delayms=3000"
	}
}
```

Other preview types already in the file: `youtube` + `youtubeId`, `canva` + `canvaEmbedUrl`, `pdf` + `pdfUrl`, `spotify` + `spotifyEmbedUrl`, `github-readme`. YouTube/Spotify/Canva can omit `preview` and let `lib/presentations-static-props.ts` infer from `contentUrl`. Google Slides must set `slidesEmbedUrl` — the loader does not derive it from docs.google.com.

Icons/colors: `feather:book` for slides, `feather:youtube` + `#c4302b` for YouTube, `feather:headphones` + `#1ed760` for audio. Pick a unique hex for a new event brand.

Optional `githubUrl` when there is a companion repo.

JSON uses tabs.

## i18n — required

Add `talks.items.<slug>.title` and `talks.items.<slug>.description` in **PT first**, then EN.

- PT title usually matches `presentations.json` title.
- EN is not a literal translation. Keep Operator/terminal voice. Product names stay (`Backstage`, `Internal Developer Portals`).
- `scripts/talks-check.ts` fails if locale slugs ≠ presentation slugs.

If the Remotion intro count is hardcoded (`presentation.hero.steps.talks`, today "N DevOps talks"), bump PT and EN to the new `presentations.json` length.

## Remotion catalogue

`data/talks.json` feeds `TalksScene` (first 5 cards). Prepend the new talk (`title`, `icon`, `color`, `description`, `url` = `contentUrl`). This file is not the site catalogue.

## OG images

```bash
yarn talks:og
yarn talks:check
```

Writes `public/og/talks/<slug>.png` and `public/og/talks/<slug>-en.png`. Commit the PNGs. `talks:check` also verifies pixels against the deterministic renderer — do not hand-edit the images.

## E2E

`e2e/smoke.spec.ts` hardcodes the newest home card as `a[href="/talks/<latest-slug>"]`. When the new talk is the most recent dated entry, update that selector. `TALK_COUNT` already reads `presentations.length`. Individual-page golden tests may keep a stable older slug.

## Validate

```bash
yarn i18n:check
yarn talks:check
yarn type-check
yarn build
```

Sitemap and `/talks/<slug>` + `/en/talks/<slug>` come from `getStaticPaths` — no extra route files. After `yarn export`, `yarn sitemap:check` / `yarn ai:check` if you touched SEO/GEO artifacts; a catalogue-only talk usually does not.

## Surfaces this automatically covers

Home cards, `/talks`, `/presentations` (inline preview), `/talks/<slug>` PT/EN, JSON-LD `PresentationDigitalDocument`, OG/Twitter image, PostHog on card/detail, sitemap after export.
