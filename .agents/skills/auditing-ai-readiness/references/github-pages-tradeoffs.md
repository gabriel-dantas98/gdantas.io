# GitHub Pages readiness tradeoffs

The site is a static Next.js export deployed directly to GitHub Pages. Classify evidence by who controls it.

## Deterministic blockers

These are repository-owned and must pass before readiness approval:

-   exported sitemap/indexability and canonical PT/EN routes;
-   `robots.txt` with sitemap, explicit AI-bot access, and Content Signals;
-   `llms.txt` and `llms-full.txt` with resolvable internal links;
-   localized HTML metadata and required JSON-LD;
-   `/.well-known/agent-skills/index.json`, the public `SKILL.md`, and a digest matching its exact bytes.

Use `yarn ai:prepare`, `yarn export`, `yarn sitemap:check`, and `yarn ai:check` as the evidence boundary. A public scanner regression in one of these supported checks requires investigation and reconciliation; do not dismiss it as hosting noise.

## Accepted GitHub Pages limitations

The following live checks are non-blocking while GitHub Pages remains the host:

-   HTTP `Link` response headers;
-   DNS-AID, unless DNS records are separately configured;
-   `Accept: text/markdown` content negotiation;
-   custom response headers.

Scanner network, service, and response-schema failures are also advisory. Record the warning artifact; they never replace or invalidate deterministic checks.

## Capabilities not applicable by default

API catalogs, OAuth/OIDC metadata, protected-resource metadata, MCP or A2A cards, WebMCP tools, bot authentication, and commerce/payment protocols are not readiness gaps for this static portfolio. They become applicable only after the corresponding runtime capability is real. Never create placeholder endpoints to improve a scanner level.
