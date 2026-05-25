<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into gdantas.io. Here's a summary of all changes made:

- **`pages/_app.tsx`** — Added `posthog.init()` (with reverse proxy host `/ingest`, error tracking via `capture_exceptions: true`, and debug mode in development). Wired `posthog.capture('$pageview')` on `routeChangeComplete` for accurate SPA pageview tracking.
- **`next.config.js`** — Added reverse proxy rewrites (`/ingest/*` → `us.i.posthog.com`) so PostHog events bypass ad blockers. Added `skipTrailingSlashRedirect: true` as required for the PostHog proxy.
- **`pages/index.tsx`** — Tracks CTA card clicks (TALK/CONNECT/BUILD), talk card clicks on homepage, and contact link clicks (LinkedIn/GitHub/Medium).
- **`pages/talks.tsx`** — Tracks talk card clicks on the `/talks` page.
- **`pages/projects.tsx`** — Tracks project pod clicks on the `/projects` page.
- **`pages/presentations.tsx`** — Tracks `./play ↗` and `./src ↗` button clicks on individual presentations.
- **`pages/links.tsx`** — Tracks link row clicks on the `/links` page.
- **`pages/writing.tsx`** — Tracks live post link clicks on the `/writing` page.
- **`.env.local`** — Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables.

| Event | Description | File |
|---|---|---|
| `cta_clicked` | User clicks one of the PING --help CTA cards (TALK, CONNECT, BUILD) on the homepage | `pages/index.tsx` |
| `talk_card_clicked` | User clicks a talk card in the homepage 04 ls ~/talks section | `pages/index.tsx` |
| `contact_link_clicked` | User clicks a contact link (LinkedIn, GitHub, Medium) in the homepage footer | `pages/index.tsx` |
| `talk_clicked` | User clicks a talk card on the /talks page | `pages/talks.tsx` |
| `project_clicked` | User clicks a project pod on the /projects page | `pages/projects.tsx` |
| `presentation_played` | User clicks the ./play ↗ button on a presentation | `pages/presentations.tsx` |
| `presentation_src_opened` | User clicks the ./src ↗ button to open a presentation's source on GitHub | `pages/presentations.tsx` |
| `link_clicked` | User clicks a link row on the /links page | `pages/links.tsx` |
| `writing_post_opened` | User clicks a live post link on the /writing page | `pages/writing.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1596700)
- [CTA Clicks Over Time](/insights/0kdKGUOP) — Track engagement with the homepage TALK/CONNECT/BUILD CTAs over time
- [CTA Clicks by Type](/insights/oWGflqpc) — See which CTA drives the most conversions (broken down by cta_type)
- [Content Engagement (Talks + Presentations + Writing)](/insights/THIz4J5w) — Aggregate content interaction across all content pages
- [Project Clicks](/insights/NTvo7duz) — Monitor open-source project engagement
- [Contact & Links Clicks](/insights/BEeMeGv5) — Compare direct contact clicks vs. links page traffic

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
