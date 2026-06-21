# blog-home-nuxt Windows deploy (Nuxt SSR + PM2)
# Usage: npm run deploy

param(
  [string]$EnvFileName = 'deploy.local.env'
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
. (Join-Path $ScriptDir 'ssh-lib.ps1')
Initialize-DeployConsoleEncoding

$Root = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$EnvFile = Join-Path $ScriptDir $EnvFileName
$PackDir = Join-Path $ScriptDir '.pack'
$RemoteScript = Join-Path $ScriptDir 'remote-deploy.sh'

if (-not (Test-Path $EnvFile)) {
  throw "Missing $EnvFile - copy deploy.local.env.example to deploy.local.env"
}

$cfg = @{}
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    $cfg[$parts[0].Trim()] = $parts[1].Trim()
  }
}

$DeployHost = $cfg['DEPLOY_HOST']
$DeployUser = $cfg['DEPLOY_USER']
$DeployPort = if ($cfg['DEPLOY_PORT']) { $cfg['DEPLOY_PORT'] } else { '22' }
$DeployPassword = $cfg['DEPLOY_PASSWORD']
$RemoteDir = $cfg['DEPLOY_REMOTE_DIR']
$HostKey = $cfg['DEPLOY_HOSTKEY']
$Pm2App = $cfg['DEPLOY_PM2_APP']
$TarName = if ($cfg['DEPLOY_TAR_NAME']) { $cfg['DEPLOY_TAR_NAME'] } else { 'blog-home-nuxt.tar.gz' }
Assert-SafeTarName $TarName
$EcosystemFile = 'ecosystem.config.cjs'
$EcosystemSrc = Join-Path $ScriptDir $EcosystemFile

if (-not $DeployHost -or -not $DeployUser -or -not $RemoteDir -or -not $Pm2App) {
  throw 'deploy.local.env needs DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR, DEPLOY_PM2_APP'
}

if (-not (Test-Path $EcosystemSrc)) {
  throw "Missing ecosystem file: $EcosystemSrc"
}

$envProd = Join-Path $Root '.env.production'
if (-not (Test-Path $envProd)) {
  throw 'Missing .env.production in project root'
}

function Find-Executable {
  param([string]$Name)
  $paths = @(
    $Name,
    "$env:ProgramFiles\PuTTY\$Name.exe",
    "${env:ProgramFiles(x86)}\PuTTY\$Name.exe"
  )
  foreach ($p in $paths) {
    if (Test-Path $p) { return $p }
    $cmd = Get-Command $p -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  return $null
}

$Plink = Find-Executable -Name 'plink'
$Pscp = Find-Executable -Name 'pscp'
$usePlink = $DeployPassword -and $Plink -and $Pscp

$plinkArgs = @('-batch', '-P', $DeployPort)
if ($HostKey) { $plinkArgs += @('-hostkey', $HostKey) }
if ($usePlink) { $plinkArgs += @('-pw', $DeployPassword) }

$pscpArgs = @('-batch', '-P', $DeployPort)
if ($HostKey) { $pscpArgs += @('-hostkey', $HostKey) }
if ($usePlink) { $pscpArgs += @('-pw', $DeployPassword) }

function Invoke-Remote {
  param([string]$Command)
  if ($usePlink) {
    & $Plink @plinkArgs "$DeployUser@$DeployHost" $Command
    if ($LASTEXITCODE -ne 0) { throw 'plink failed' }
  } else {
    ssh -p $DeployPort -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$DeployUser@$DeployHost" $Command
    if ($LASTEXITCODE -ne 0) { throw 'ssh failed' }
  }
}

function Copy-ToRemote {
  param([string]$LocalPath, [string]$RemotePath)
  if ($usePlink) {
    & $Pscp @pscpArgs $LocalPath "$DeployUser@$DeployHost`:$RemotePath"
    if ($LASTEXITCODE -ne 0) { throw "pscp failed: $LocalPath" }
  } else {
    scp -P $DeployPort -o BatchMode=yes -o StrictHostKeyChecking=accept-new $LocalPath "$DeployUser@$DeployHost`:$RemotePath"
    if ($LASTEXITCODE -ne 0) { throw 'scp failed' }
  }
}

Write-Host "==> Remote: $RemoteDir | PM2: $Pm2App"
Write-Host "==> Build env: .env.production (project root)"

Write-Host '==> [1/5] Local build'
Push-Location $Root
npm ci --ignore-scripts
npm run build
Pop-Location

$outputDir = Join-Path $Root '.output'
if (-not (Test-Path (Join-Path $outputDir 'server/index.mjs'))) {
  throw 'Build failed: .output/server/index.mjs not found'
}

Write-Host '==> [2/5] Pack tar'
$staging = Join-Path $PackDir 'staging'
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null

Copy-Item -Recurse $outputDir (Join-Path $staging 'output')
Copy-Item (Join-Path $Root 'package.json') $staging
if (Test-Path (Join-Path $Root 'package-lock.json')) {
  Copy-Item (Join-Path $Root 'package-lock.json') $staging
}
Copy-Item $EcosystemSrc (Join-Path $staging $EcosystemFile)

if (-not (Test-Path $PackDir)) { New-Item -ItemType Directory -Path $PackDir | Out-Null }
$tarLocal = Join-Path $PackDir $TarName
if (Test-Path $tarLocal) { Remove-Item -Force $tarLocal }

Push-Location $staging
tar -czf $tarLocal .
Pop-Location

$tarSize = [math]::Round((Get-Item $tarLocal).Length / 1MB, 2)
Write-Host "==> Tar: $tarLocal ($tarSize MB)"

Write-Host '==> [3/5] Upload'
$remoteTar = "/tmp/$TarName"
Invoke-Remote "mkdir -p $RemoteDir"
Copy-ToRemote $tarLocal $remoteTar
Copy-ToRemote (Join-Path $ScriptDir 'release-lib.sh') '/tmp/release-lib.sh'
Copy-ToRemote $RemoteScript '/tmp/remote-deploy.sh'

Write-Host '==> [4/5] Remote: release -> switch -> pm2 reload'
$eRemoteDir = Escape-ShellSingleQuoted $RemoteDir
$ePm2App = Escape-ShellSingleQuoted $Pm2App
$eEcosystemFile = Escape-ShellSingleQuoted $EcosystemFile
$eRemoteTar = Escape-ShellSingleQuoted $remoteTar
$remoteCmd = "chmod +x /tmp/remote-deploy.sh && DEPLOY_REMOTE_DIR='$eRemoteDir' DEPLOY_PM2_APP='$ePm2App' DEPLOY_ECOSYSTEM_FILE='$eEcosystemFile' DEPLOY_TAR_PATH='$eRemoteTar' bash /tmp/remote-deploy.sh"
Invoke-Remote $remoteCmd

Write-Host '==> [5/5] Verify'
Invoke-Remote "source ~/.nvm/nvm.sh && DEPLOY_REMOTE_DIR='$eRemoteDir' source /tmp/release-lib.sh && release_pm2_verify '$ePm2App'"

Write-Host '==> Deploy finished - https://jiang-xia.top/'