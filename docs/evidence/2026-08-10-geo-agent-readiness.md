# Evidências locais — GEO e Agent Readiness

Auditoria executada em 2026-08-10, às 14:54 UTC (11:54 BRT), sobre o commit
`a8871d758e89eeeac47ee881686ae1ed8507f356`. O alvo continua sendo um export
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
62/62 testes unitários passaram; 141 testes E2E passaram e 1 caso mobile-only
foi pulado intencionalmente no projeto desktop. Durante a verificação, dois
testes antigos de navegação expuseram corridas de locale/visibilidade no
navegador mobile. Os
commits `aa2aea3` e `a8871d7` corrigem somente o setup e os seletores desses
testes, sem alterar código de produção.

## Contrato do export estático

`yarn export && yarn sitemap:check && yarn ai:check` verificou:

- 24 URLs indexáveis, todas resolvendo para HTML exportado;
- 24/24 páginas com exatamente um `h1`, `lang` PT/EN, título e descrição
  localizados, canonical limpo e alternates simétricos;
- 24/24 páginas indexáveis e 2 arquivos de sitemap sem `changefreq` ou
  `lastmod` inventados;
- 16 documentos JSON-LD válidos nas rotas que exigem dados estruturados;
- `llms.txt` e `llms-full.txt` com destinos internos existentes;
- `robots.txt` com sitemap, regras explícitas para crawlers e
  `Content-Signal: ai-train=no, search=yes, ai-input=yes`;
- Agent Skills discovery v0.2.0 com digest dos bytes públicos:
  `sha256:e2d240d5cf8e37037d8b2e88c12f6daba45585a2f5554bf7ff05498443c3a563`.

Nenhum caminho MCP, OAuth/OIDC, A2A ou catálogo de API foi adicionado ao diff
ou ao diretório `out/`. O site não anuncia capacidades que o GitHub Pages não
executa.

## Lighthouse antes e depois

O mesmo `out/` foi servido em `127.0.0.1:4173`. Foram feitas três medições da
home e usada a mediana; `/en/` teve uma medição, igual ao baseline.

```sh
npx --yes lighthouse@12.8.2 http://127.0.0.1:4173/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags='--headless --no-sandbox' --output=json
```

### Home — mediana de três execuções

| Métrica | Baseline | Final | Delta |
| --- | ---: | ---: | ---: |
| Performance | 81 | 82 | +1 |
| Accessibility | 100 | 100 | 0 |
| Best Practices | 96 | 96 | 0 |
| SEO | 100 | 92 | -8¹ |
| FCP | 906,1 ms | 903,7 ms | -2,4 ms |
| LCP | 3.408,2 ms | 3.405,6 ms | -2,6 ms |
| TBT | 279,5 ms | 246,5 ms | -33,0 ms |
| CLS | 0,07861 | 0,07742 | -0,00119 |
| Speed Index | 5.415,9 ms | 4.958,3 ms | -457,6 ms |
| Transferência | 964.488 B | 966.681 B | +2.193 B (+0,23%) |
| Requisições | 63 | 63 | 0 |

### Mirror EN — uma execução

| Métrica | Baseline | Final | Delta |
| --- | ---: | ---: | ---: |
| Performance | 75 | 83 | +8 |
| Accessibility | 100 | 100 | 0 |
| Best Practices | 96 | 96 | 0 |
| SEO | 100 | 92 | -8¹ |
| FCP | 906,2 ms | 904,4 ms | -1,7 ms |
| LCP | 3.407,3 ms | 3.405,7 ms | -1,6 ms |
| TBT | 488,0 ms | 235,5 ms | -252,5 ms |
| CLS | 0,07897 | 0,07899 | +0,00002 |
| Speed Index | 4.573,8 ms | 4.541,0 ms | -32,8 ms |
| Transferência | 861.606 B | 870.130 B | +8.524 B (+0,99%) |
| Requisições | 57 | 57 | 0 |

¹ O único audit SEO perdido é `robots-txt`: Lighthouse 12.8.2 ainda marca
cada `Content-Signal` como `Unknown directive`. O arquivo continua parseável,
o sitemap e a indexabilidade passam nos gates locais, e o sinal é deliberado
para a política de uso por IA descrita pela Cloudflare. Removê-lo faria o
scanner de Agent Readiness falhar no requisito que esta mudança implementa.

## Bundle e rede

O build passou de 333 kB para 334 kB de First Load JS compartilhado e da home
(arredondamento do relatório Next.js). No trace Lighthouse da home, scripts
locais continuaram em 13 requisições e passaram de 400.959 B para 402.964 B:
+2.005 B (+0,50%), concentrados no classificador de referral e no chunk comum.
Não houve nova dependência em `package.json`/lockfile nem novo padrão de URL,
origem ou requisição no navegador. JSON-LD, `llms*`, robots e Agent Skills são
bytes estáticos e não geram hidratação ou fetch client-side.

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
