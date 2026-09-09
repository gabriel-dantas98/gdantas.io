# Medição observacional de GEO

Este protocolo acompanha se o conteúdo está sendo descoberto e citado por mecanismos de busca e
assistentes de IA. Ele não transforma respostas de modelos em teste determinístico: modelos, índices,
localização e personalização variam entre execuções.

## Evento de entrada

O PostHog recebe `ai_referral_landed` uma única vez no carregamento inicial quando o navegador informa
um referrer externo reconhecido. O evento contém somente:

-   `ai_source`: origem classificada, como `chatgpt`, `perplexity` ou `claude`;
-   `landing_path`: caminho sem query string nem fragmento;
-   `locale`: `pt` ou `en`;
-   `content_type`: grupo editorial inferido da rota.

Não são enviados URL completo do referrer, parâmetros de campanha, texto consultado, identidade ou
qualquer outro dado pessoal. Navegação interna e origens desconhecidas não geram o evento. A ausência
do evento não prova ausência de citação: alguns clientes não enviam `document.referrer`.

## Perguntas-alvo v1 (2026-08-10)

Executar em PT e EN, sem conta quando possível, registrando modelo, data, idioma, resposta e URLs
citadas.

| ID     | Tema                 | Pergunta PT                                                                               | Question EN                                                                               |
| ------ | -------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| GEO-01 | Platform Engineering | Quais práticas ajudam a implantar Platform Engineering sem criar um time de tickets?      | Which practices help adopt Platform Engineering without creating a ticket team?           |
| GEO-02 | Backstage            | Como estruturar um portal Backstage que continue útil depois do lançamento?               | How do you structure a Backstage portal that stays useful after launch?                   |
| GEO-03 | IDP                  | Como medir se uma Internal Developer Platform reduz carga cognitiva?                      | How can an Internal Developer Platform's reduction of cognitive load be measured?         |
| GEO-04 | MCP                  | Quais cuidados de arquitetura e segurança importam ao adotar MCP em plataformas internas? | Which architecture and security concerns matter when adopting MCP for internal platforms? |
| GEO-05 | Incidentes           | Como agentes podem ajudar em incidentes sem executar ações perigosas automaticamente?     | How can agents help during incidents without automatically taking dangerous actions?      |
| GEO-06 | RAG                  | Quando RAG é adequado para documentação interna de engenharia?                            | When is RAG appropriate for internal engineering documentation?                           |

Qualquer mudança de formulação cria uma nova versão da tabela; não reescrever resultados históricos.

## Rotina mensal

1. No PostHog, contar `ai_referral_landed` por `ai_source`, `landing_path`, `locale` e `content_type`;
   comparar janelas equivalentes, mantendo volumes pequenos como sinal direcional.
2. Rodar as perguntas-alvo em uma amostra fixa de mecanismos e marcar quais páginas do site foram
   citadas. Guardar também respostas sem citação e citações incorretas.
3. Conferir no Google Search Console e Bing Webmaster Tools impressões, cliques, consultas e páginas
   relacionadas aos mesmos seis temas.
4. Triangular os três sinais. Priorizar conteúdo quando referrals, citações e demanda de busca apontarem
   na mesma direção; investigar divergências antes de alterar páginas.
5. Registrar período, ferramentas, limitações e mudanças publicadas. Comparar tendências, não uma
   resposta isolada de modelo.

O gate de release continua sendo técnico e reproduzível (`ai:check`, sitemap, export e testes). A
observação de respostas externas orienta conteúdo, mas nunca bloqueia deploy nem comprova causalidade.
