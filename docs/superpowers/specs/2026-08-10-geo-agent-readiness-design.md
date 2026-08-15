# GEO e Agent Readiness no GitHub Pages

**Data:** 2026-08-10

**Status:** aprovado em conversa; aguardando revisão do documento

**Site:** `https://gdantas.com.br`
**Restrição arquitetural:** manter o domínio servido diretamente pelo GitHub Pages, sem proxy ou edge intermediário.

## Objetivo

Tornar o site mais fácil de descobrir, interpretar, citar e navegar por mecanismos generativos e agentes, sem otimizar artificialmente para o score de um fornecedor e sem publicar capacidades inexistentes.

O resultado deve combinar:

1. fundamentos de SEO/GEO no HTML e no conteúdo;
2. artefatos estáticos úteis para agentes;
3. verificações determinísticas no CI;
4. auditoria live recorrente e não bloqueante;
5. skills reutilizáveis para orientar futuras mudanças.

## Limites e decisões

### GitHub Pages permanece direto

O site continuará usando o fluxo atual de static export e GitHub Pages. Como consequência:

- não será implementada content negotiation por `Accept: text/markdown`;
- não será declarado suporte a Markdown negotiation;
- não serão prometidos `Link` response headers;
- os headers de `next.config.js` não serão tratados como ativos em produção;
- o alvo honesto do scanner da Cloudflare será Level 2, `Bot-Aware`.

Versões Markdown explícitas, como `/llms.txt` e `/llms-full.txt`, serão publicadas, mas não apresentadas como content negotiation.

### Política de uso por IA

Publicar a seguinte política no `robots.txt`:

```text
Content-Signal: ai-train=no, search=yes, ai-input=yes
```

Objetivo da política:

- permitir descoberta e citação em busca;
- permitir grounding e uso durante inferência;
- não conceder preferência afirmativa para treinamento de modelos.

Manter regras explícitas de acesso para os principais crawlers de busca/grounding, sem depender apenas do wildcard. Não confundir `OAI-SearchBot` com `GPTBot`: busca e treinamento têm finalidades diferentes.

### Sem endpoints de fachada

Não publicar MCP Server Card, API Catalog, OAuth metadata, Auth.md ou A2A Agent Card enquanto o site não oferecer essas capacidades de verdade. Commerce protocols permanecem fora de escopo.

## Estado inicial observado

O scan de produção em 2026-08-10 retornou `Level 1 — Basic Web Presence`.

Passes:

- `robots.txt` válido;
- sitemap válido e referenciado pelo robots;
- crawlers de IA permitidos pelo wildcard.

Lacunas relevantes:

- nenhuma rota principal auditada continha `h1`;
- rotas EN usavam descrições SEO em português;
- nenhuma rota publicada continha JSON-LD;
- sitemap anunciava `changefreq: daily` e `lastmod` de build para todas as páginas;
- não havia Content Signals;
- não havia skill pública nem índice de Agent Skills;
- não havia verificação contínua específica para GEO/agent readiness.

Lacunas aceitas pela restrição de hosting:

- Markdown negotiation;
- `Link` response headers;
- headers customizados declarados no Next.js;
- níveis do scanner que dependem sequencialmente de Markdown negotiation.

## Arquitetura

### 1. Camada semântica e de entidade

Criar um módulo central para JSON-LD e identidade canônica. Usar IDs estáveis:

```text
https://gdantas.com.br/#person
https://gdantas.com.br/#website
```

Publicar:

- home: `Person` e `WebSite`;
- about: `ProfilePage` referenciando `#person`;
- páginas de coleção: `CollectionPage` e `ItemList` quando houver itens reais;
- talk individual: `PresentationDigitalDocument`, com `VideoObject` ou `PodcastEpisode` somente quando aplicável;
- páginas profundas: `BreadcrumbList` quando a navegação tiver breadcrumbs equivalentes.

Structured data deve refletir apenas conteúdo visível. Perfis públicos entram em `sameAs`; referências editoriais externas não devem ser marcadas como perfis oficiais.

### 2. HTML e copy recuperáveis

Garantir em cada página indexável:

- exatamente um `h1` descritivo;
- hierarquia `h1` → `h2` → `h3` sem saltos artificiais;
- alinhamento entre title, description e `h1`;
- metadados no mesmo idioma do documento;
- canonical sem query string ou fragment;
- alternates PT/EN simétricos;
- significado textual preservado mesmo com a estética Operator.

Símbolos de terminal podem continuar visíveis, mas devem ser decorativos para acessibilidade quando não fizerem parte do significado.

Conteúdo editorial deve favorecer blocos autocontidos: resumo direto, contexto, aprendizados, dados verificáveis, fontes e links para materiais primários. Não criar FAQs artificiais.

### 3. Conteúdo por talk

Reusar o design já registrado em `docs/superpowers/specs/2026-08-10-talk-pages-seo-design.md` e os testes locais existentes. Cada talk deve ter URL PT/EN própria e dados suficientes para recuperação independente da galeria.

Esta iniciativa não deve duplicar uma segunda implementação de talk pages. A camada GEO apenas adicionará contratos semânticos e validações ao modelo aprovado.

### 4. Artefatos estáticos para agentes

Manter `/llms.txt` como índice conciso e adicionar `/llms-full.txt` como representação expandida do conteúdo público canônico.

Publicar uma Agent Skill genuína para exploração do conteúdo do site:

```text
/.well-known/agent-skills/index.json
/.well-known/agent-skills/exploring-gdantas/SKILL.md
```

A skill deve ensinar um agente a:

- identificar expertise e experiência pública de Gabriel;
- localizar talks, artigos e materiais primários;
- preferir URLs canônicas e o idioma solicitado;
- distinguir fatos publicados pelo site de referências externas;
- citar a página específica usada como evidência.

O índice seguirá a versão vigente do Agent Skills Discovery RFC, incluindo digest SHA-256 gerado e validado pelo build. A skill pública não executará ações e não prometerá ferramentas inexistentes.

### 5. Skill local de manutenção

Criar uma skill repo-local:

```text
.agents/skills/auditing-ai-readiness/
```

Ela deve disparar em mudanças envolvendo SEO, GEO, conteúdo, i18n, robots, sitemap, `llms*.txt`, JSON-LD, skills públicas, hosting ou agent readiness.

A skill orientará julgamento e usará os scripts do repositório para verificações mecânicas. Deve conter uma regra explícita contra perseguir score com endpoints falsos e registrar os tradeoffs permanentes do GitHub Pages.

### 6. Verificador determinístico

Adicionar um comando local, por exemplo `yarn ai:check`, executado depois do static export. O verificador analisará `out/` e falhará quando encontrar:

- página indexável sem exatamente um `h1`;
- locale, title, description ou canonical incoerentes;
- canonical contendo query/fragment;
- pares PT/EN sem alternates correspondentes;
- JSON-LD inválido ou entidades principais ausentes;
- sitemap contendo página `noindex`;
- `changefreq` ou `lastmod` artificiais;
- `llms.txt`/`llms-full.txt` ausentes ou apontando para URLs inválidas;
- índice de Agent Skills inválido;
- digest diferente dos bytes publicados;
- robots sem sitemap ou sem a política Content Signal aprovada.

O verificador não exigirá Markdown negotiation nem response headers impossíveis no GitHub Pages.

### 7. Auditoria live

Adicionar um comando separado, `yarn ai:scan`, que chama o scanner público e salva um relatório estruturado. Falhas de rede ou mudanças no serviço externo não podem reprovar o build principal.

Criar workflow recorrente e manual que:

1. escaneia `https://gdantas.com.br`;
2. registra nível e checks;
3. compara apenas regressões de checks explicitamente suportados;
4. publica JSON/Markdown como artifact e job summary;
5. não falha por checks documentados como não aplicáveis.

O URL Scanner autenticado da Cloudflare poderá substituir o endpoint público no futuro via secrets, sem ser requisito inicial.

### 8. Medição de GEO real

Adicionar classificação de referrals de mecanismos de IA às pageviews do PostHog, sem PII. Capturar um evento específico somente na landing inicial, com propriedades como:

- `ai_source`;
- `landing_path`;
- `locale`;
- `content_type` quando inferível da rota.

Não renomear eventos existentes. Documentar uma rotina de análise combinando referrals, páginas citadas e consultas observadas em Search Console/Bing Webmaster Tools.

Manter um pequeno conjunto versionado de perguntas-alvo sobre Platform Engineering, Backstage, IDP, MCP, incidentes e RAG. Resultados de modelos externos são observacionais e não entram como gate determinístico.

## Fluxo de dados

```text
fontes do repo
  → Next.js static export
  → geração de sitemap e artefatos de agentes
  → ai:check sobre out/
  → deploy no GitHub Pages
  → ai:scan recorrente sobre produção
  → relatório de regressões + métricas PostHog
```

## Tratamento de erros

- Erros determinísticos do export quebram CI com URL, regra e evidência.
- Scanner externo indisponível gera warning e artifact, não falha de deploy.
- JSON-LD inválido falha antes do deploy.
- Digest de skill divergente falha antes do deploy.
- Mudança de schema/RFC externo não é aplicada automaticamente; exige revisão da skill e dos testes.
- Uma página sem par traduzido só pode ser indexada se estiver explicitamente marcada como monolíngue no contrato do verificador.

## Testes

Implementar em TDD:

- testes unitários para canonical, locale, JSON-LD e classificação de referrals;
- testes do verificador contra fixtures válidas e inválidas;
- testes E2E para H1, alternates e JSON-LD nas rotas principais;
- testes do gerador e digest da skill pública;
- execução real de `ai:check` sobre `out/`;
- scan live manual após deploy.

Preservar e integrar os testes não commitados existentes em `e2e/smoke.spec.ts`; eles pertencem ao usuário e não devem ser sobrescritos.

## Critérios de aceite

1. Todas as páginas indexáveis do export passam no contrato semântico.
2. PT e EN têm title, description, canonical e alternates coerentes.
3. Home/about/coleções/talks publicam JSON-LD válido e factual.
4. `robots.txt` declara a política aprovada e continua referenciando o sitemap.
5. `/llms.txt`, `/llms-full.txt` e a Agent Skill pública são válidos.
6. `yarn ai:check` integra o CI principal.
7. `yarn ai:scan` e o workflow recorrente produzem relatório sem bloquear deploy por dependência externa.
8. Produção alcança Agent Readiness Level 2 ou documenta evidência de mudança no rubric do scanner.
9. Nenhum endpoint MCP/OAuth/API/A2A fictício é publicado.
10. O site continua sendo servido diretamente pelo GitHub Pages.

## Fora de escopo

- proxy Cloudflare, Worker, Vercel ou migração de hosting;
- Markdown content negotiation;
- response headers customizados;
- servidor MCP;
- autenticação OAuth/Auth.md;
- A2A e agentic commerce;
- garantia de ranking ou citação por qualquer modelo.

## Sequenciamento recomendado

1. Implementar verificador e contratos semânticos básicos.
2. Corrigir H1, SEO bilíngue, canonical e sitemap.
3. Adicionar JSON-LD.
4. Atualizar robots e artefatos `llms*`.
5. Publicar e validar a Agent Skill.
6. Integrar CI e auditoria live.
7. Adicionar medição PostHog.
8. Validar produção e registrar o novo baseline.
