# Adicionar Apresentação

**Skill canônica:** `.agents/skills/adding-a-talk/SKILL.md`

Não siga o schema antigo (`url` + `preview.youtubeId` sem slug). O pipeline atual é:

1. Extrair título / evento / data / local / URL do conteúdo.
2. Criar slug kebab único (`^[a-z0-9][a-z0-9-]{0,63}$`).
3. Inserir no topo de `data/presentations.json` (mais recente primeiro) com `slug`, `event`, `contentUrl`, `date`, `location`, `preview`.
4. Google Slides: `preview.slidesEmbedUrl` = `https://docs.google.com/presentation/d/<ID>/embed?start=false&loop=false&delayms=3000`.
5. Adicionar `talks.items.<slug>.{title,description}` em `locales/pt.json` **e** `locales/en.json`.
6. Prepend em `data/talks.json` (Remotion, 5 cards).
7. Atualizar a contagem em `presentation.hero.steps.talks` (PT+EN) se estiver hardcoded.
8. `yarn talks:og` → commitar `public/og/talks/<slug>.png` e `<slug>-en.png`.
9. Se for a talk mais recente, atualizar o seletor em `e2e/smoke.spec.ts` (`a[href="/talks/<slug>"]`).
10. `yarn i18n:check && yarn talks:check && yarn type-check && yarn build`.

Não criar page shells. Não adicionar `talks.home.*`. Não pular i18n nem OG.
