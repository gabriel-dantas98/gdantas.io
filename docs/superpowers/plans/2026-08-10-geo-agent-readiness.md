# GEO and Agent Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the statically exported GitHub Pages site semantically strong, honestly Bot-Aware, continuously auditable, and measurable without adding server capabilities or regressing frontend performance.

**Architecture:** Keep all runtime output static. Pure TypeScript builders define canonical URLs, JSON-LD, AI-referral classification, Agent Skill discovery, and export validation; React only serializes already-built metadata. A deterministic post-export checker gates CI, while the external Cloudflare scan remains advisory and writes reports without blocking deploys.

**Tech Stack:** Next.js 13 Pages Router, React 18, TypeScript 4.4, `tsx`, Node built-in test runner/assert/crypto/fs, Playwright, next-sitemap, GitHub Actions, PostHog.

## Global Constraints

- Keep `gdantas.com.br` served directly by GitHub Pages; no Worker, proxy, edge runtime, App Router, `getServerSideProps`, or fake API/MCP/OAuth/A2A endpoints.
- Do not claim Markdown content negotiation or custom HTTP response headers; explicit `.txt` and `.md` artifacts are static resources only.
- Target Cloudflare Agent Readiness Level 2 (`Bot-Aware`) honestly.
- Publish `Content-Signal: ai-train=no, search=yes, ai-input=yes` in `robots.txt`.
- Agent Skills discovery uses draft v0.2.0: `$schema` is `https://schemas.agentskills.io/discovery/0.2.0/schema.json`; digest is `sha256:` plus 64 lowercase hex characters over the raw `SKILL.md` bytes.
- All visible copy changes update `locales/pt.json` and `locales/en.json` together; run `yarn i18n:check`.
- Do not remove or rename existing PostHog events. New properties use snake_case and contain no PII.
- Preserve the committed `e2e/smoke.spec.ts` flows and append semantic assertions without overwriting unrelated tests.
- New metadata must be server-rendered in the static HTML and must not add network requests, render-blocking resources, hydration work, or client-side schema generation.
- Performance evidence compares the same local production export, Chrome/Lighthouse 12.8.2 settings, and routes before/after. Treat Lighthouse as lab evidence, not a guarantee of production field Web Vitals.

---

### Task 1: Pure semantic and referral contracts

**Files:**
- Create: `lib/site-metadata.ts`
- Create: `lib/structured-data.ts`
- Create: `lib/ai-referrals.ts`
- Create: `tests/site-metadata.test.ts`
- Create: `tests/structured-data.test.ts`
- Create: `tests/ai-referrals.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `SITE_URL`, `PERSON_ID`, `WEBSITE_ID`, `canonicalUrl(path)`, `alternateUrls(path)`, `buildPerson(locale)`, `buildWebSite(locale)`, `buildProfilePage(locale, path)`, `buildCollectionPage(input)`, `classifyAiReferral(referrer)`, `inferContentType(path)`, and `buildAiReferralEvent(input)`.
- `buildAiReferralEvent` returns `null` for non-AI/empty/internal referrers; otherwise `{ ai_source, landing_path, locale, content_type }` with no query string, fragment, or full referrer.

- [ ] **Step 1: Write failing tests for canonical and alternate normalization**

  Cover `/`, `/about?utm_source=x#bio`, `/en/about/`, and absolute rejection. Literal expectations use `https://gdantas.com.br`, PT root paths, EN `/en` mirrors, and no query/fragment/trailing duplicate slash.

- [ ] **Step 2: Run the focused metadata test and verify RED**

  Run: `yarn tsx --test tests/site-metadata.test.ts`

  Expected: FAIL because `lib/site-metadata.ts` does not exist.

- [ ] **Step 3: Implement the minimal site metadata functions**

  Keep them dependency-free and safe to execute during static rendering.

- [ ] **Step 4: Run the metadata test and verify GREEN**

  Run: `yarn tsx --test tests/site-metadata.test.ts`

  Expected: all metadata cases pass with pristine output.

- [ ] **Step 5: Write failing JSON-LD tests**

  Assert literal stable IDs; factual `Person.sameAs` values for GitHub, LinkedIn, and Medium; localized `WebSite.inLanguage`; `ProfilePage.mainEntity.@id`; `CollectionPage.mainEntity` as a real `ItemList`; and absence of `undefined` after JSON serialization.

- [ ] **Step 6: Run the JSON-LD test and verify RED**

  Run: `yarn tsx --test tests/structured-data.test.ts`

  Expected: FAIL because `lib/structured-data.ts` does not exist.

- [ ] **Step 7: Implement minimal schema builders**

  Use schema.org objects only for visible facts. Do not add fake awards, ratings, employers, actions, APIs, or capabilities.

- [ ] **Step 8: Run the JSON-LD test and verify GREEN**

  Run: `yarn tsx --test tests/structured-data.test.ts`

  Expected: all schema cases pass.

- [ ] **Step 9: Write failing AI-referral tests**

  Cover ChatGPT/OpenAI, Perplexity, Claude, Copilot, Gemini/Bard, Mistral, internal origin, ordinary search engines, invalid URLs, query stripping, `/en/*` locale, and content types for home/about/talks/writing/projects/other.

- [ ] **Step 10: Run the referral test and verify RED**

  Run: `yarn tsx --test tests/ai-referrals.test.ts`

  Expected: FAIL because `lib/ai-referrals.ts` does not exist.

- [ ] **Step 11: Implement the referral classifier and event builder**

  Match hostname boundaries, never substring-match arbitrary URLs, and never return the original referrer.

- [ ] **Step 12: Run all unit tests and verify GREEN**

  Add `test:unit` as `tsx --test tests/*.test.ts`, then run `yarn test:unit`.

- [ ] **Step 13: Commit**

  Commit message: `test: define contratos de GEO antes do HTML`

### Task 2: Static HTML semantics, bilingual metadata, and JSON-LD

**Files:**
- Create: `components/Seo/StructuredData.tsx`
- Modify: `components/Operator/Layout.tsx`
- Modify: `components/Operator/primitives.tsx`
- Modify: `components/pages/HomePage.tsx`
- Modify: `components/pages/AboutPage.tsx`
- Modify: `components/pages/DoctrinePage.tsx`
- Modify: `components/pages/LinksPage.tsx`
- Modify: `components/pages/PresentationPage.tsx`
- Modify: `components/pages/PresentationsPage.tsx`
- Modify: `components/pages/ProjectsPage.tsx`
- Modify: `components/pages/SidequestsPage.tsx`
- Modify: `components/pages/StatusPage.tsx`
- Modify: `components/pages/TalksPage.tsx`
- Modify: `components/pages/TimelinePage.tsx`
- Modify: `components/pages/WritingPage.tsx`
- Modify: `lib/seo.ts`
- Modify: `locales/pt.json`
- Modify: `locales/en.json`
- Modify: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: Task 1 metadata and schema builders.
- Produces: one visible `<h1>` on each indexable route; localized title/description/canonical/alternates; server-rendered JSON-LD on home, about, and real collection pages.
- `Sec` accepts `as?: 'h1' | 'h2'`, defaulting to `h2`; each page's first `Sec` passes `as="h1"`.
- `OperatorPage` accepts `structuredData?: object | object[]` and serializes it through `StructuredData`.

- [ ] **Step 1: Add failing E2E assertions**

  For all PT/EN indexable route cases, assert exactly one `h1`, canonical without query/fragment, symmetric `pt-BR`/`en`/`x-default` alternates, and metadata language. For `/`, `/en`, `/about`, `/en/about`, `/talks`, `/en/talks`, `/projects`, `/en/projects`, `/writing`, and `/en/writing`, parse each `script[type="application/ld+json"]` and assert valid JSON with the expected top-level schema type.

- [ ] **Step 2: Run the semantic E2E subset and verify RED**

  Run: `yarn e2e --project=chromium --grep "semantic contract"`

  Expected: FAIL because pages currently have no `h1` and no JSON-LD.

- [ ] **Step 3: Implement semantic headings without changing layout geometry**

  Replace the home hero title wrapper with `h1` while preserving all styles and margins. Add `as="h1"` only to the first `Sec` on each other indexable page. Mark purely decorative prompt punctuation `aria-hidden` only when it conveys no text.

- [ ] **Step 4: Add bilingual SEO copy**

  Add a `seo` namespace in PT first and EN second for each page title/description. Read it through `useT`; remove Portuguese hard-coded descriptions from EN mirrors. Keep route names, commands, product names, and URLs untranslated per repository policy.

- [ ] **Step 5: Render factual JSON-LD statically**

  Home emits `Person` + `WebSite`; about emits `ProfilePage`; talks/presentations/projects/writing/links emit `CollectionPage` with `ItemList` only from the items already rendered. Use `dangerouslySetInnerHTML` only for `JSON.stringify(data).replace(/</g, '\\u003c')`.

- [ ] **Step 6: Run focused unit, i18n, export, and E2E checks and verify GREEN**

  Run: `yarn test:unit && yarn i18n:check && yarn export && yarn e2e --project=chromium --grep "semantic contract"`

- [ ] **Step 7: Verify no new client dependency or request**

  Run: `yarn build`

  Record route First Load JS and shared First Load JS for later comparison. Expected: no new dependency and no material shared-JS increase from metadata serialization.

- [ ] **Step 8: Commit**

  Commit message: `feat: torna o HTML legível por gente e agentes`

### Task 3: Static agent artifacts and deterministic export checker

**Files:**
- Create: `public/llms-full.txt`
- Create: `public/.well-known/agent-skills/exploring-gdantas/SKILL.md`
- Create: `public/.well-known/agent-skills/index.json`
- Create: `public/robots.txt`
- Create: `scripts/agent-skill-index.ts`
- Create: `scripts/ai-readiness-check.ts`
- Create: `tests/agent-skill-index.test.ts`
- Create: `tests/ai-readiness-check.test.ts`
- Create fixtures under: `tests/fixtures/ai-readiness/`
- Modify: `public/llms.txt`
- Modify: `.gitignore`
- Modify: `next-sitemap.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `buildSkillIndex(skillBytes)`, `validateSkillIndex(index, skillBytes)`, `auditExport(outDir): AuditResult`, CLI `yarn ai:prepare`, and CLI `yarn ai:check`.
- `AuditResult` is `{ ok: boolean; checks: { id: string; status: 'pass' | 'fail'; evidence: string[] }[] }`.
- `ai:prepare` deterministically rewrites only `public/.well-known/agent-skills/index.json` from the public `SKILL.md` bytes.

- [ ] **Step 1: Write failing skill index tests**

  Assert the exact v0.2.0 schema URI, one `skill-md` entry, matching frontmatter name/description, path-absolute URL, lowercase SHA-256 digest, byte sensitivity, and rejection of a tampered skill.

- [ ] **Step 2: Run skill index tests and verify RED**

  Run: `yarn tsx --test tests/agent-skill-index.test.ts`

  Expected: FAIL because the generator does not exist.

- [ ] **Step 3: Implement the public skill and deterministic index generator**

  The skill teaches evidence-first exploration of this site, canonical-language choice, primary-source preference, fact/reference distinction, and page-specific citation. It performs no actions and claims no tools. Generate the checked-in index and add `ai:prepare`.

- [ ] **Step 4: Run skill index tests and verify GREEN**

  Run: `yarn ai:prepare && yarn tsx --test tests/agent-skill-index.test.ts`

- [ ] **Step 5: Write failing export-audit fixture tests**

  Fixtures must independently fail for zero/two H1s, wrong `lang`, missing/wrong-language title/description, canonical query/fragment, asymmetric alternates, invalid/missing JSON-LD for required route types, sitemap/noindex mismatch, synthetic `changefreq`/`lastmod`, missing/broken `llms*.txt` URL, missing Content-Signal/sitemap in robots, invalid Agent Skills schema, and digest mismatch. A complete valid fixture passes.

- [ ] **Step 6: Run export-audit tests and verify RED**

  Run: `yarn tsx --test tests/ai-readiness-check.test.ts`

  Expected: FAIL because the checker does not exist.

- [ ] **Step 7: Implement the minimal deterministic checker**

  Scan sitemap URLs, resolve each URL to exported HTML, and emit route/check/evidence on failure. Do not test Markdown negotiation, HTTP headers, OAuth, MCP, A2A, API catalogs, commerce, or network availability.

- [ ] **Step 8: Publish honest robots and llms artifacts**

  Track `public/robots.txt` by removing its ignore rule, disable next-sitemap robots generation, declare sitemap, the approved Content-Signal, wildcard access, and explicit search/grounding agents. Keep training crawlers separate from search crawlers. `llms.txt` is concise; `llms-full.txt` expands only canonical public facts and links.

- [ ] **Step 9: Remove artificial sitemap freshness**

  Set `autoLastmod: false` and use a custom `transform` that omits `changefreq` and `lastmod` while preserving loc/priority/alternate data that is truthful.

- [ ] **Step 10: Run fixture tests and real export audit**

  Run: `yarn test:unit && yarn export && yarn sitemap:check && yarn ai:check`

  Expected: all fixture tests pass and every sitemap route passes the real export audit.

- [ ] **Step 11: Commit**

  Commit message: `feat: publica sinais estáticos e audita o export`

### Task 4: CI integration, advisory live scanner, and maintenance skill

**Files:**
- Create: `scripts/ai-readiness-scan.ts`
- Create: `tests/ai-readiness-scan.test.ts`
- Create: `.github/workflows/agent-readiness.yml`
- Create: `.agents/skills/auditing-ai-readiness/SKILL.md`
- Create: `.agents/skills/auditing-ai-readiness/agents/openai.yaml`
- Create: `.agents/skills/auditing-ai-readiness/references/github-pages-tradeoffs.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/nextjs.yml`
- Modify: `scripts/ci.sh`
- Modify: `package.json`

**Interfaces:**
- Produces: `normalizeScanReport(payload)`, `compareSupportedChecks(current, baseline)`, and CLI `yarn ai:scan [url] [output-dir]`.
- Supported checks are robots, sitemap, explicit AI bot rules, Content Signals, and Agent Skills. Accepted GitHub Pages limitations are Link headers, DNS-AID unless separately configured, Markdown negotiation, and custom response headers. Capability checks are not applicable unless the site later gains the real capability.

- [ ] **Step 1: Write failing scan normalization tests**

  Use complete recorded fixtures shaped like the public `POST https://isitagentready.com/api/scan` response. Assert level/check extraction, supported-regression detection, accepted-gap suppression, error payload handling, and no throw for additive unknown fields.

- [ ] **Step 2: Run scanner tests and verify RED**

  Run: `yarn tsx --test tests/ai-readiness-scan.test.ts`

  Expected: FAIL because the scanner module does not exist.

- [ ] **Step 3: Implement the advisory scanner**

  POST `{ "url": target }`, write timestamped JSON and Markdown, and exit zero with an explicit warning report for network/service/schema failures. Never send secrets to the public endpoint. `ai:scan` must not run in the main CI/deploy gate.

- [ ] **Step 4: Run scanner tests and verify GREEN**

  Run: `yarn tsx --test tests/ai-readiness-scan.test.ts`

- [ ] **Step 5: Integrate deterministic gates**

  Run `ai:prepare` before build/export and `ai:check` after sitemap generation in local CI, PR CI, and Pages deploy. Preserve direct GitHub Pages deployment.

- [ ] **Step 6: Add scheduled/manual advisory workflow**

  Schedule weekly and allow `workflow_dispatch`; run the scanner for `https://gdantas.com.br`; always upload JSON/Markdown and append Markdown to `$GITHUB_STEP_SUMMARY`; do not fail solely because the external scanner is unavailable or an accepted check is unsupported.

- [ ] **Step 7: Initialize the repo-local maintenance skill**

  Run the `skill-creator` `scripts/init_skill.py` for `auditing-ai-readiness` with `--resources references` and interface values: display name `Audit AI Readiness`, short description `Audit GEO and static agent-readiness signals`, and default prompt `Use $auditing-ai-readiness to audit this site's GEO and agent-readiness changes.` Remove generated placeholders before continuing.

- [ ] **Step 8: Write the skill from the observed RED failures**

  Trigger on SEO/GEO/content/i18n/robots/sitemap/`llms*`/JSON-LD/public skills/hosting/readiness changes. Five no-skill controls all omitted `yarn ai:prepare`, `yarn sitemap:check`, and `yarn ai:check`; one accepted a missing sitemap; one used `yarn start` instead of serving `out/`; accepted scanner gaps were vague. Shape an exact evidence recipe requiring `yarn ai:prepare`, `yarn export`, `yarn sitemap:check`, `yarn ai:check`, and relevant E2E against `out/`. Separate deterministic blockers from the accepted GitHub Pages limitations in the reference. Keep the explicit rule against fake endpoints concise because 3/3 separate controls already refused them without guidance.

- [ ] **Step 9: Validate and forward-test the skill**

  Run `skill-creator/scripts/quick_validate.py` on the folder, confirm `SKILL.md` stays under 500 words, and run five fresh-context applications of the same workflow scenario with the skill. Passing behavior names the exact repo commands in order, requires sitemap/public skill/digest, rejects fake capabilities, and treats only documented GitHub Pages limitations/external scanner availability as non-blocking. If a new rationalization appears, add one focused counter and re-test it.

- [ ] **Step 10: Run workflow/static validation**

  Run: `yarn test:unit && yarn ai:prepare && yarn type-check && yarn i18n:check`

- [ ] **Step 11: Commit**

  Commit message: `ci: mantém agent readiness verificável sem fingir runtime`

### Task 5: Initial-landing PostHog measurement

**Files:**
- Modify: `pages/_app.tsx`
- Modify: `tests/ai-referrals.test.ts`
- Create: `docs/geo-measurement.md`

**Interfaces:**
- Consumes: Task 1 `buildAiReferralEvent`.
- Produces: one `ai_referral_landed` capture per initial document load when `document.referrer` is a recognized external AI source.

- [ ] **Step 1: Extend the failing referral test**

  Assert the event name contract and that event properties contain only `ai_source`, `landing_path`, `locale`, and `content_type`; internal/unknown sources remain `null`.

- [ ] **Step 2: Run referral tests and verify RED**

  Run: `yarn tsx --test tests/ai-referrals.test.ts`

  Expected: FAIL because the event-name/export contract is absent.

- [ ] **Step 3: Implement one initial-landing capture**

  Build the event before capture, after PostHog initialization, inside the existing one-time effect. Do not capture the full referrer, query parameters, user identity, or repeat route changes. Preserve all existing events unchanged.

- [ ] **Step 4: Document the observational measurement routine**

  Version target questions for Platform Engineering, Backstage, IDP, MCP, incidents, and RAG; combine PostHog landing counts with cited pages and Search Console/Bing observations. State that model answers are not deterministic gates.

- [ ] **Step 5: Run tests and inspect event contracts**

  Run: `yarn test:unit && yarn type-check && rg -n "posthog.capture" pages components`

- [ ] **Step 6: Commit**

  Commit message: `feat: mede referrals de IA sem coletar PII`

### Task 6: Full verification and evidence in PR

**Files:**
- Create: `docs/evidence/2026-08-10-geo-agent-readiness.md`
- Modify: PR #36 body/comment only after evidence exists.

**Interfaces:**
- Consumes: final branch, baseline Lighthouse JSON in `/tmp/geo-baseline-*.json`, exported `out/`, and GitHub PR #36.
- Produces: reproducible evidence document with commands, versions, pass/fail counts, build sizes, Lighthouse medians, limitations, and live-scan status.

- [ ] **Step 1: Run the complete local gate fresh**

  Run: `yarn lint && yarn type-check && yarn i18n:check && yarn test:unit && yarn export && yarn sitemap:check && yarn ai:check && yarn e2e`

  Expected: exit 0 for every command and zero test failures.

- [ ] **Step 2: Capture export evidence**

  Record sitemap URL count, checked route count, H1/metadata/JSON-LD/robots/llms/skill check counts, skill digest, and the absence of fake MCP/OAuth/API/A2A artifacts.

- [ ] **Step 3: Repeat Lighthouse under baseline conditions**

  Serve `out/` on port 4173. Run Lighthouse 12.8.2 three times for `/` and once for `/en/` with performance/accessibility/best-practices/SEO categories and headless Chrome. Compare median home FCP/LCP/TBT/CLS/Speed Index/bytes/category scores and the EN run against baseline. Explain lab variance and flag any material regression for investigation before push.

- [ ] **Step 4: Compare build output**

  Compare shared First Load JS and home/representative route First Load JS against the baseline build. New JSON-LD/static files may increase HTML/export bytes; they must not add a new browser dependency or network request.

- [ ] **Step 5: Write the evidence document**

  Include environment (`node`, Yarn, Chrome, Lighthouse), exact commands, UTC/local timestamp, baseline/final tables, known GitHub Pages tradeoffs, and the statement that lab evidence cannot guarantee post-deploy field Web Vitals. Link primary Cloudflare and Agent Skills RFC sources.

- [ ] **Step 6: Run final diff and repository verification**

  Run: `git diff --check origin/main...HEAD`, inspect `git status --short`, and confirm no user-owned files outside the branch were changed.

- [ ] **Step 7: Commit evidence**

  Commit message: `docs: registra evidências locais de GEO e performance`

- [ ] **Step 8: Push and update PR #36**

  Push `feat/geo-agent-readiness`, update the PR description with implementation summary and verification table, and add a comment linking the evidence document. Keep the PR draft until GitHub checks complete.
