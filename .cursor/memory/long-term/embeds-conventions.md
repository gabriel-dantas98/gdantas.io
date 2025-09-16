## 2025-09-16 14:13:08

Project: gdantas.io

-   Presentations page `pages/presentations.tsx` now normalizes Canva links via `toCanvaEmbed` even if `canvaEmbedUrl` is provided in JSON, ensuring `.../view?embed` is used to avoid CSP issues.
-   Spotify preview uses responsive heights (`h-64 sm:h-80 md:h-96`) and `h-full` iframe to match other cards, replacing previous fixed `style={{ height: 352 }}`.
-   When adding new entries in `data/presentations.json`, you can set `contentUrl` to any Canva design link or provide `preview.canvaEmbedUrl`; both get normalized. For Spotify, you can provide `contentUrl` or `preview.spotifyEmbedUrl`; both work.
-   If Canva still refuses to frame, ensure the design is published with Embed (Share > More > Embed > Generate) and is public/anyone with link.
