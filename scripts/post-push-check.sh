#!/usr/bin/env bash
# Hook PostToolUse pro Bash. Dispara depois de qualquer comando, mas só age
# quando o comando foi um `git push` real. Acha o PR aberto da branch atual
# e mostra os check-runs em tempo real até concluírem.
#
# Output vai pra stderr (Claude Code lê) e pro stdout (loga visualmente).

set -uo pipefail

# Lê o evento JSON do hook do stdin. Claude Code passa: tool_name, tool_input.
PAYLOAD=$(cat || true)

# Filtra: só age em Bash com `git push` no comando.
TOOL_NAME=$(printf '%s' "$PAYLOAD" | jq -r '.tool_name // empty' 2>/dev/null)
COMMAND=$(printf '%s' "$PAYLOAD" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [[ "$TOOL_NAME" != "Bash" ]]; then exit 0; fi
# Match liberal: aceita "git push", "git push origin <branch>", "git push -u ...".
# Não dispara em "git push --dry-run".
if ! echo "$COMMAND" | grep -Eq '(^|[^a-zA-Z])git[[:space:]]+push([[:space:]]|$)'; then exit 0; fi
if echo "$COMMAND" | grep -q -- '--dry-run'; then exit 0; fi

# Precisa do gh CLI pra checar PR.
if ! command -v gh >/dev/null 2>&1; then
	echo "[post-push-check] gh CLI ausente — skip." >&2
	exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
if [[ -z "$BRANCH" || "$BRANCH" == "HEAD" ]]; then
	echo "[post-push-check] sem branch ativo — skip." >&2
	exit 0
fi

# Acha PR aberto da branch atual.
PR=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number' 2>/dev/null || true)
if [[ -z "$PR" || "$PR" == "null" ]]; then
	echo "[post-push-check] sem PR aberto pra $BRANCH — skip." >&2
	exit 0
fi

echo "[post-push-check] aguardando checks do PR #$PR ($BRANCH)..." >&2

# `gh pr checks --watch` espera até concluir, exit 0 = todos pass, 8 = falhou,
# 1 = sem checks ou outro erro. Imprime status na medida que checa.
gh pr checks "$PR" --watch >&2
RC=$?

case $RC in
	0)
		echo "[post-push-check] ✅ todos os check-runs passaram em PR #$PR." >&2
		;;
	8)
		echo "[post-push-check] ❌ algum check falhou em PR #$PR. Veja com: gh pr checks $PR" >&2
		;;
	*)
		echo "[post-push-check] gh pr checks retornou $RC — veja com: gh pr checks $PR" >&2
		;;
esac

# Sempre exit 0 — hook não deve bloquear o fluxo do Claude.
exit 0
