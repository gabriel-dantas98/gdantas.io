<#
    eva-fix-windows.ps1

    Fix standalone para alunos Windows (Anaconda/Spyder) rodando o lab da Eva
    (aulas/05-foundry-agents/03-agente-Eva-azure) com Azure CLI + Azure for
    Students.

    Corrige:
      - PYTHONPATH/PYTHONHOME do Anaconda vazando pro Python embutido do az CLI,
        quebrando pyexpat e outros imports nativos (UnicodeEncodeError no
        "az acr build", falhas em extensoes, etc).
      - Extensao "containerapp" residual/desatualizada.
      - Providers Microsoft.App e Microsoft.OperationalInsights nao registrados.
      - Extensao application-insights ausente.
      - Regiao errada: Azure for Students NAO libera eastus2.

    NAO desinstala Anaconda, Spyder nem nenhum Python do sistema. So isola o
    Python embutido do Azure CLI, que e um interpretador separado.

    Uso (via internet, sem salvar nada):
        irm <RAW_URL> | iex

    Uso seguro (le o script antes de rodar):
        iwr -OutFile eva-fix-windows.ps1 <RAW_URL>
        powershell -ExecutionPolicy Bypass -File .\eva-fix-windows.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Msg)
    Write-Host ""
    Write-Host "==> $Msg" -ForegroundColor Cyan
}

function Write-Warn2 {
    param([string]$Msg)
    Write-Host "AVISO: $Msg" -ForegroundColor Yellow
}

function Write-Ok {
    param([string]$Msg)
    Write-Host "OK: $Msg" -ForegroundColor Green
}

# --- 1. Limpar variaveis Python da Anaconda que vazam pro az CLI ---
Write-Step "Limpando PYTHONPATH / PYTHONHOME / PYTHONSTARTUP da sessao atual"
Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue
Remove-Item Env:PYTHONHOME -ErrorAction SilentlyContinue
Remove-Item Env:PYTHONSTARTUP -ErrorAction SilentlyContinue
$env:PYTHONUTF8 = "1"
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    chcp 65001 | Out-Null
} catch {
    Write-Warn2 "Nao consegui trocar o console para UTF-8, seguindo mesmo assim."
}
Write-Ok "Variaveis limpas e PYTHONUTF8=1 setado (so nesta sessao)."

# --- 2. Checar se o az CLI esta instalado ---
Write-Step "Checando Azure CLI"
$azCmd = Get-Command az -ErrorAction SilentlyContinue
if (-not $azCmd) {
    Write-Warn2 "Azure CLI (az) nao encontrado no PATH."
    Write-Host ""
    Write-Host "Instale com:" -ForegroundColor Yellow
    Write-Host "    winget install Microsoft.AzureCLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Depois abra um terminal NOVO e rode este script de novo."
    exit 1
}
Write-Ok "az encontrado em: $($azCmd.Source)"

# --- 3. Isolar o Python embutido do az CLI do Anaconda (python*._pth) ---
Write-Step "Isolando o Python embutido do Azure CLI (arquivo _pth)"

$cli2Candidates = @(
    "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2",
    "${env:ProgramFiles(x86)}\Microsoft SDKs\Azure\CLI2"
)
$cli2Root = $cli2Candidates | Where-Object { Test-Path (Join-Path $_ "python.exe") } | Select-Object -First 1

if (-not $cli2Root) {
    Write-Warn2 "Nao achei o Python embutido do az CLI em nenhum dos locais padrao:"
    $cli2Candidates | ForEach-Object { Write-Warn2 "  $_" }
    Write-Warn2 "Pulando essa etapa. Se o proximo teste (pyexpat) falhar, o plano B (reinstalar so o CLI) resolve."
} else {
    $pythonExe = Join-Path $cli2Root "python.exe"
    $pthPath = Join-Path $cli2Root "python313._pth"
    $pthContent = @"
python313.zip
.
Lib
Lib\site-packages

import site
"@

    $canWriteDirectly = $false
    try {
        $testFile = Join-Path $cli2Root "._write_test"
        Set-Content -Path $testFile -Value "test" -ErrorAction Stop
        Remove-Item $testFile -ErrorAction SilentlyContinue
        $canWriteDirectly = $true
    } catch {
        $canWriteDirectly = $false
    }

    if ($canWriteDirectly) {
        Set-Content -Path $pthPath -Value $pthContent -Encoding ASCII
        Write-Ok "Escrevi $pthPath diretamente (ja tinha permissao)."
    } else {
        Write-Warn2 "Sem permissao em '$cli2Root'. Pedindo elevacao (UAC) so pra esse arquivo..."
        $escapedContent = $pthContent -replace "'", "''"
        $elevatedCmd = "Set-Content -Path '$pthPath' -Value '$escapedContent' -Encoding ASCII"
        $bytes = [System.Text.Encoding]::Unicode.GetBytes($elevatedCmd)
        $encoded = [Convert]::ToBase64String($bytes)
        try {
            Start-Process -FilePath "powershell.exe" -Verb RunAs -Wait `
                -ArgumentList "-NoProfile", "-EncodedCommand", $encoded
            if (Test-Path $pthPath) {
                Write-Ok "Escrevi $pthPath via elevacao."
            } else {
                Write-Warn2 "Nao consegui confirmar a escrita de $pthPath (UAC negado?). Seguindo assim mesmo."
            }
        } catch {
            Write-Warn2 "Elevacao falhou ou foi cancelada. Rode o script como Administrador se o teste abaixo falhar."
        }
    }

    # --- 4. Testar pyexpat com o Python do az CLI ---
    Write-Step "Testando pyexpat no Python do Azure CLI"
    $testResult = & $pythonExe -c "import pyexpat; print('pyexpat-ok')" 2>&1
    if ($LASTEXITCODE -eq 0 -and $testResult -match "pyexpat-ok") {
        Write-Ok "pyexpat funcionando no Python do az CLI."
    } else {
        Write-Warn2 "pyexpat ainda falhando. Indo pro plano B: reinstalar so o Azure CLI (Anaconda fica intacto)."
        Write-Warn2 "  winget uninstall Microsoft.AzureCLI"
        Write-Warn2 "  winget install Microsoft.AzureCLI"
        try {
            winget uninstall Microsoft.AzureCLI --silent
            winget install Microsoft.AzureCLI --silent
            Write-Ok "Azure CLI reinstalado. Abra um terminal NOVO e rode este script de novo do zero."
        } catch {
            Write-Warn2 "winget nao concluiu sozinho. Rode manualmente:"
            Write-Warn2 "  winget uninstall Microsoft.AzureCLI"
            Write-Warn2 "  winget install Microsoft.AzureCLI"
        }
        exit 1
    }
}

# --- 5. Remover extensao containerapp residual (o CLI recente ja tem built-in) ---
Write-Step "Checando extensao 'containerapp' residual"
$existingExt = az extension list --query "[?name=='containerapp'].name" -o tsv 2>$null
if ($existingExt) {
    Write-Warn2 "Extensao 'containerapp' instalada manualmente, removendo (o comando ja e nativo do CLI)."
    az extension remove --name containerapp
    Write-Ok "Extensao 'containerapp' removida."
} else {
    Write-Ok "Nenhuma extensao 'containerapp' residual encontrada."
}

# --- 6. Confirmar que containerapp funciona (built-in) ---
Write-Step "Testando 'az containerapp env list'"
az containerapp env list -o table
if ($LASTEXITCODE -ne 0) {
    Write-Warn2 "'az containerapp env list' falhou. Confira 'az login' e a assinatura ativa (az account show)."
} else {
    Write-Ok "Container Apps respondendo normalmente."
}

# --- 7. Instalar extensao application-insights ---
Write-Step "Instalando extensao 'application-insights'"
az extension add --name application-insights --only-show-errors 2>$null
$hasAppInsights = az extension list --query "[?name=='application-insights'].name" -o tsv 2>$null
if ($hasAppInsights) {
    Write-Ok "Extensao 'application-insights' instalada via 'az extension add'."
} else {
    Write-Warn2 "'az extension add' falhou (comum quando o pip do az CLI esta quebrado). Baixando o .whl manualmente."
    $wheelUrl = "https://azcliprod.blob.core.windows.net/cli-extensions/application_insights-1.2.3-py2.py3-none-any.whl"
    $destDir = Join-Path $env:USERPROFILE ".azure\cliextensions\application-insights"
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    $tmpWheel = Join-Path $env:TEMP "application_insights-1.2.3-py2.py3-none-any.whl"
    $tmpZip = Join-Path $env:TEMP "application_insights-1.2.3-py2.py3-none-any.zip"
    try {
        Invoke-WebRequest -Uri $wheelUrl -OutFile $tmpWheel -UseBasicParsing
        Copy-Item $tmpWheel $tmpZip -Force
        Expand-Archive -Path $tmpZip -DestinationPath $destDir -Force
        Write-Ok "application-insights extraido manualmente em $destDir."
    } catch {
        Write-Warn2 "Download/extracao manual tambem falhou: $($_.Exception.Message)"
        Write-Warn2 "Continuando sem essa extensao - nao e bloqueante pro deploy da Eva."
    } finally {
        Remove-Item $tmpWheel -ErrorAction SilentlyContinue
        Remove-Item $tmpZip -ErrorAction SilentlyContinue
    }
}

# --- 8. Registrar providers necessarios pro Container Apps ---
Write-Step "Registrando providers Microsoft.App e Microsoft.OperationalInsights"
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait
Write-Ok "Providers registrados."

# --- 9. Aviso de regiao (Azure for Students) ---
Write-Step "Regiao correta para Azure for Students"
Write-Warn2 "NAO use 'eastus2' - a assinatura Azure for Students NAO libera essa regiao."
Write-Host "Use uma destas:" -ForegroundColor Yellow
Write-Host "    eastus  (recomendado, mais modelos disponiveis no Foundry)"
Write-Host "    brazilsouth"
Write-Host "    centralus"
Write-Host "    canadacentral"
Write-Host "    chilecentral"

# --- 10. Resumo final ---
Write-Step "Tudo pronto. Rode o deploy assim:"
Write-Host ""
Write-Host "    .\deploy.ps1 -FoundryResourceName <foundry> -Local eastus" -ForegroundColor Green
Write-Host ""
Write-Host "(troque <foundry> pelo nome do seu recurso Foundry, sem o '.services.ai.azure.com')"

exit 0
