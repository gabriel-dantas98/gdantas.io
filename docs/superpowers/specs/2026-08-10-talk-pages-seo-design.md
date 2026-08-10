# Páginas individuais de talks — design

## Objetivo

Permitir que cada talk tenha uma URL própria, estática e compartilhável, com conteúdo e metadata específicos para mecanismos de busca e previews sociais.

## Rotas

- Português: `/talks/<slug>`
- Inglês: `/en/talks/<slug>`
- Os slugs vêm exclusivamente de `data/presentations.json`.
- Um slug inexistente deve resultar na página 404 durante a navegação e não deve ser gerado no export estático.

As duas árvores de rotas serão geradas no build com `getStaticPaths` e `fallback: false`, mantendo compatibilidade com Next.js Pages Router e GitHub Pages.

## Fonte de dados e componentes

`data/presentations.json` continua sendo a única fonte de verdade. A normalização já usada na página de apresentações será extraída para uma função reutilizável, responsável por:

- localizar uma apresentação pelo slug;
- normalizar previews de YouTube, Spotify, Canva, Google Slides, PDF e GitHub README;
- preparar os dados serializáveis usados por `getStaticProps`.

A página visual ficará em `components/pages/TalkPage.tsx`. Os arquivos `pages/talks/[slug].tsx` e `pages/en/talks/[slug].tsx` serão shells pequenos que reutilizam o componente e informam o locale, conforme a convenção do repositório.

## Experiência da página

Cada página individual deve exibir:

- tipo da talk, data e local quando disponíveis;
- título e descrição;
- preview incorporado quando disponível;
- CTA para abrir o conteúdo original;
- CTA para abrir o código-fonte quando houver `githubUrl`;
- retorno para a lista completa de talks.

Os cards da página `/talks` deixam de abrir apenas o modal e passam a navegar para a rota individual correspondente. A listagem continua leve e não carrega todos os embeds ao mesmo tempo.

## SEO e compartilhamento

Cada talk terá metadata específica no HTML estático:

- `<title>` derivado do título da talk;
- meta description derivada da descrição;
- URL canônica absoluta em `https://gdantas.com.br`;
- Open Graph com tipo `article`, título, descrição e URL;
- Twitter Card com título e descrição;
- JSON-LD do tipo `PresentationDigitalDocument`, incluindo nome, descrição, data e URL quando os campos existirem.

As páginas em inglês usarão canonical próprio com prefixo `/en` e `hreflang` apontando para as versões PT, EN e `x-default`. Os dados editoriais existentes das talks permanecem iguais; somente novas copies de interface serão adicionadas em paridade a `locales/pt.json` e `locales/en.json`.

## Analytics

O contrato existente de PostHog será preservado:

- o clique no card continua disparando `talk_clicked`;
- o evento passa a incluir `talk_slug`, além das propriedades atuais;
- CTAs da página individual usam os eventos existentes `presentation_played` e `presentation_src_opened`, com `talk_slug` acrescentado;
- nenhuma PII será enviada.

## Tratamento de dados inválidos

O build deve falhar com uma mensagem explícita se alguma entrada não tiver slug ou se houver slugs duplicados. Isso evita gerar URLs conflitantes silenciosamente. Preview ausente não impede a página: o conteúdo textual e os CTAs disponíveis continuam sendo renderizados.

## Testes e evidências

A implementação seguirá TDD para a geração/validação das rotas e dos dados. A validação final incluirá:

- testes automatizados das rotas, slugs e metadata;
- `yarn type-check`;
- `yarn i18n:check`;
- `yarn build` e export estático;
- teste real no navegador navegando da lista para uma talk;
- acesso direto a uma URL PT e sua versão EN;
- verificação de título, canonical, Open Graph e JSON-LD no HTML;
- screenshots desktop e mobile em `output/playwright/`.

## Fora de escopo

- traduzir retroativamente títulos e descrições das talks;
- alterar os slugs existentes;
- criar CMS ou armazenamento adicional;
- migrar para App Router ou adicionar runtime server-side;
- remover a página `/presentations` ou suas âncoras atuais.
