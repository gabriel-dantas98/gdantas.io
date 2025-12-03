# Adicionar Apresentação

Adiciona uma nova apresentação ao arquivo `data/presentations.json` seguindo o mesmo processo automatizado.

## Processo

1. **Acessar o link fornecido** usando o browser para extrair informações:

    - Título do vídeo/apresentação
    - Descrição completa (expandir se necessário)
    - Data de publicação/transmissão
    - Localização (se disponível)

2. **Extrair informações do YouTube** (se for link do YouTube):

    - YouTube ID do vídeo
    - Título completo
    - Descrição (primeira parte ou resumo relevante)
    - Data formatada como YYYY-MM-DD

3. **Criar entrada no formato correto**:

    ```json
    {
      "title": "Título extraído",
      "icon": "feather:youtube" (ou "feather:book" para outros tipos),
      "color": "#c4302b" (vermelho para YouTube, ou outra cor apropriada),
      "description": "Descrição em português baseada no conteúdo",
      "contentUrl": "URL fornecida",
      "date": "YYYY-MM-DD",
      "location": "Online" (ou localização se disponível),
      "preview": {
        "type": "youtube",
        "youtubeId": "ID_EXTRAIDO"
      }
    }
    ```

4. **Adicionar ao arquivo** `data/presentations.json`:

    - Inserir no início do array
    - Reorganizar TODAS as entradas por data (mais recente primeiro)
    - Itens sem data ficam no final

5. **Validações**:
    - Verificar se a apresentação já existe (por URL ou YouTube ID)
    - Garantir formato JSON válido
    - Manter indentação com tabs

## Exemplo de uso

Quando o usuário fornecer uma URL do YouTube ou outro link de apresentação, seguir este processo automaticamente.
