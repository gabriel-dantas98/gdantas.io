---
name: auditing-ai-readiness
description: Use when changing this site's SEO, GEO, content, i18n, robots.txt, sitemap, llms.txt or llms-full.txt, JSON-LD, public Agent Skills, hosting, or agent-readiness signals.
---

# Auditing AI Readiness

## Principle

Audit the exported static product, not source-code intent. Treat reproducible repository checks as authority and public scanning as advisory evidence.

Read [references/github-pages-tradeoffs.md](references/github-pages-tradeoffs.md) before classifying a finding or proposing hosting changes.

## Required evidence recipe

Run these commands in order from the repository root:

1. `yarn ai:prepare` — regenerate the public Agent Skills index and digest before building.
2. `yarn export` — produce the deployable `out/` tree.
3. `yarn sitemap:check` — generate and validate exported sitemaps. A missing sitemap is a failure.
4. `yarn ai:check` — require robots, sitemap routes, `llms*`, localized metadata/JSON-LD, the public skill, and its matching digest.
5. Run relevant browser coverage with `yarn e2e --project=chromium --grep "<relevant contract>"`. The Playwright configuration serves `out/`; do not substitute `yarn start`.

Also run `yarn test:unit`, `yarn type-check`, and `yarn i18n:check` for changed code or localized content. Report each command and its observed result; grep/curl spot checks do not replace this recipe.

## Verdict contract

Mark the audit blocked when any deterministic command fails, or when sitemap, public skill, or digest evidence is missing. Fix the artifact or implementation and rerun from step 1.

Use `yarn ai:scan https://gdantas.com.br <output-dir>` only against a deployed public URL. Keep its timestamped JSON/Markdown out of git. Reconcile supported-check regressions with deterministic evidence; only scanner availability and the documented GitHub Pages gaps are non-blocking.

Do not add API, OAuth, MCP, A2A, WebMCP, or commerce discovery files unless the site implements that real capability.

## Common mistakes

| Shortcut                                   | Required correction                                   |
| ------------------------------------------ | ----------------------------------------------------- |
| Accept a missing sitemap                   | Stop and restore it; rerun steps 1–4.                 |
| Test with `yarn start`                     | Exercise the exported `out/` site through Playwright. |
| Call scanner failures “static limitations” | Match them exactly against the tradeoffs reference.   |
