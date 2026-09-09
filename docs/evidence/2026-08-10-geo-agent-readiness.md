# Evidências locais — GEO e Agent Readiness

Auditoria refeita em 2026-08-10, entre 15:13 e 15:16 UTC (12:13–12:16 BRT),
comparando a base `fe5bd6531c473330e406cf46f6469b229a05b60d` com o merge
`e29868c50a88c6d4e242f3efb554946061a83a08`. O alvo continua sendo um export
estático publicado diretamente no GitHub Pages, sem Worker, proxy ou runtime
server-side.

## Ambiente e método

- macOS 26.5.2 (arm64), Node 26.3.0 e Yarn 3.2.0;
- Google Chrome 151.0.7922.76;
- Lighthouse 12.8.2, perfil mobile/simulated throttling padrão;
- Playwright 1.60.0, projetos Chromium desktop e Pixel 7;
- actionlint 1.7.12.

Gate autoritativo, executado do zero e com exit code 0:

```sh
yarn lint && yarn type-check && yarn i18n:check && yarn test:unit \
  && yarn export && yarn sitemap:check && yarn ai:check && yarn e2e \
  && actionlint && yarn ai:prepare \
  && git diff --exit-code -- public/.well-known/agent-skills/index.json
```

Resultado: lint, tipos, paridade PT/EN, actionlint e drift do índice sem erros;
63/63 testes unitários e 151 testes E2E passaram; 1 caso mobile-only foi
pulado intencionalmente no projeto desktop. A integração
mantém a arquitetura de páginas estáticas individuais em `/talks/<slug>` e
`/en/talks/<slug>` introduzida pela base, estendendo a ela os contratos GEO.

## Contrato do export estático

`yarn export && yarn sitemap:check && yarn ai:check` verificou:

- 52 URLs indexáveis, todas resolvendo para HTML exportado;
- 52/52 páginas com exatamente um `h1`, `lang` PT/EN, título e descrição
  localizados, canonical limpo e alternates simétricos;
- 52/52 páginas indexáveis e 2 arquivos de sitemap sem `changefreq` ou
  `lastmod` inventados;
- 44 documentos JSON-LD válidos nas rotas que exigem dados estruturados,
  incluindo `PresentationDigitalDocument` nas 28 páginas PT/EN de talks;
- `llms.txt` e `llms-full.txt` com destinos internos existentes;
- `robots.txt` com sitemap, regras explícitas para crawlers e
  `Content-Signal: ai-train=no, search=yes, ai-input=yes`;
- Agent Skills discovery v0.2.0 com digest dos bytes públicos:
  `sha256:e2d240d5cf8e37037d8b2e88c12f6daba45585a2f5554bf7ff05498443c3a563`.

Nenhum caminho MCP, OAuth/OIDC, A2A ou catálogo de API foi adicionado ao diff
ou ao diretório `out/`. O site não anuncia capacidades que o GitHub Pages não
executa.

## Lighthouse — base atual versus merge GEO

A base foi instalada e exportada em um worktree detached separado no SHA
`fe5bd65`, servida em `127.0.0.1:4181`. O merge `e29868c` foi exportado no
worktree da branch e servido em `127.0.0.1:4182`. Foram feitas três medições da
home para cada SHA e usada a mediana; `/en/` teve uma medição por SHA.

```sh
npx --yes lighthouse@12.8.2 http://127.0.0.1:PORT/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags='--headless --no-sandbox' --output=json
```

### Home — mediana de três execuções

| Métrica | Base `fe5bd65` | Merge `e29868c` | Delta |
| --- | ---: | ---: | ---: |
| Performance | 77 | 82 | +5 |
| Accessibility | 100 | 100 | 0 |
| Best Practices | 96 | 96 | 0 |
| SEO | 100 | 92 | -8¹ |
| FCP | 905,6 ms | 906,4 ms | +0,8 ms |
| LCP | 3.406,4 ms | 3.410,3 ms | +3,9 ms |
| TBT | 350,0 ms | 245,0 ms | -105,0 ms |
| CLS | 0,07751 | 0,07907 | +0,00156 |
| Speed Index | 5.260,8 ms | 4.990,0 ms | -270,8 ms |
| Transferência | 871.513 B | 873.779 B | +2.266 B (+0,26%) |
| Requisições (mediana) | 61 | 62 | +1² |

### Mirror EN — uma execução

| Métrica | Base `fe5bd65` | Merge `e29868c` | Delta |
| --- | ---: | ---: | ---: |
| Performance | 83 | 82 | -1 |
| Accessibility | 100 | 100 | 0 |
| Best Practices | 96 | 96 | 0 |
| SEO | 100 | 92 | -8¹ |
| FCP | 905,0 ms | 906,9 ms | +1,9 ms |
| LCP | 3.405,5 ms | 3.411,3 ms | +5,8 ms |
| TBT | 218,5 ms | 244,0 ms | +25,5 ms |
| CLS | 0,07734 | 0,07904 | +0,00169 |
| Speed Index | 4.950,1 ms | 4.825,4 ms | -124,7 ms |
| Transferência | 868.973 B | 870.936 B | +1.963 B (+0,23%) |
| Requisições | 57 | 57 | 0 |

¹ O único audit SEO perdido é `robots-txt`: Lighthouse 12.8.2 ainda marca
cada `Content-Signal` como `Unknown directive`. O arquivo continua parseável,
o sitemap e a indexabilidade passam nos gates locais, e o sinal é deliberado
para a política de uso por IA descrita pela Cloudflare. Removê-lo faria o
scanner de Agent Readiness falhar no requisito que esta mudança implementa.

² As três execuções de cada SHA oscilaram no mesmo intervalo de 61–62
requisições. A diferença de mediana veio de uma segunda leitura do favicon em
duas execuções do merge. Depois de normalizar porta, build ID e hashes, os
padrões de URL/recurso da base e do merge são idênticos; não apareceu uma nova
requisição atribuível ao GEO.

## Bundle e rede

Entre `fe5bd65` e `e29868c`, o First Load JS da home passou de 332 kB para
334 kB, o compartilhado de 334 kB para 335 kB e `_app` de 325 kB para 327 kB
(valores arredondados pelo Next.js). No trace Lighthouse da home, scripts
locais continuaram em 13 requisições e passaram de 400.325 B para 402.191 B:
+1.866 B (+0,47%), concentrados no classificador de referral e no chunk comum.
Não houve nova dependência em `package.json`/lockfile nem nova requisição no
trace Lighthouse medido, que navegou sem referrer de IA. Em uma landing com
referrer reconhecido, o site emite uma vez o evento `ai_referral_landed` pelo
PostHog já inicializado; esse caminho condicional não foi medido separadamente
e pode compartilhar ou adicionar transporte para a origem de analytics.
JSON-LD, `llms*`, robots e Agent Skills são bytes estáticos e não geram
hidratação ou fetch client-side.

As medições locais não mostram regressão material de FCP, LCP, TBT ou CLS. Isso
é evidência de laboratório, não garantia de Web Vitals de campo depois do
deploy; a confirmação real depende de tráfego, cache, rede e telemetria após a
publicação.

## Scanner ao vivo e limites do GitHub Pages

Em 2026-08-10T14:51:09Z, `yarn ai:scan https://gdantas.com.br` ainda reportou
**Level 1 — Basic Web Presence**. Isso é esperado antes do merge/deploy: a
produção atual passa robots e sitemap, mas ainda não contém as novas regras de
bots, Content Signals ou Agent Skills. Não há evidência pré-deploy para alegar
Level 2.

Depois da publicação, o workflow semanal/manual repetirá a leitura ao vivo. No
GitHub Pages direto continuam limitações aceitas e não bloqueantes: Link
headers, headers de resposta customizados, negociação Markdown e DNS-AID (até
ser configurado separadamente). Catálogo de API, OAuth, MCP, A2A e commerce não
são “gaps”: são capacidades não aplicáveis a este site estático e não serão
simuladas.

## Fontes primárias

- [Cloudflare — Making websites Agent Ready](https://blog.cloudflare.com/agent-readiness/)
- [Cloudflare URL Scanner API](https://developers.cloudflare.com/api/resources/url_scanner/)
- [Cloudflare Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc)
- [Is It Agent Ready?](https://isitagentready.com/)
