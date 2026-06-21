# =============================================================================
# blog-home-nuxt Windows 回滚入口
# =============================================================================

param(
  [string]$EnvFileName = 'deploy.local.env',
  [string]$BackupName = '',
  [switch]$List
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ssh-lib.ps1')
Initialize-DeployConsoleEncoding

$EnvFile = Join-Path $PSScriptRoot $EnvFileName
$RemoteScript = Join-Path $PSScriptRoot 'remote-rollback.sh'

if (-not (Test-Path $EnvFile)) {
  throw "Missing $EnvFile — copy deploy.local.env.example to deploy.local.env"
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

if (-not $DeployHost -or -not $DeployUser -or -not $RemoteDir -or -not $Pm2App) {
  throw 'deploy.local.env needs DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR, DEPLOY_PM2_APP'
}

function Find-Executable {
  param([string]$Name)
  $paths = @($Name, "$env:ProgramFiles\PuTTY\$Name.exe", "${env:ProgramFiles(x86)}\PuTTY\$Name.exe")
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

Copy-ToRemote $RemoteScript '/tmp/remote-rollback.sh'
Copy-ToRemote (Join-Path $PSScriptRoot 'release-lib.sh') '/tmp/release-lib.sh'

Assert-BackupFileName $BackupName
$eRemoteDir = Escape-ShellSingleQuoted $RemoteDir
$ePm2App = Escape-ShellSingleQuoted $Pm2App
$envPrefix = "DEPLOY_REMOTE_DIR='$eRemoteDir' DEPLOY_PM2_APP='$ePm2App' DEPLOY_ECOSYSTEM_FILE='ecosystem.config.cjs'"

if ($List) {
  Invoke-Remote "chmod +x /tmp/remote-rollback.sh && ${envPrefix} DEPLOY_ROLLBACK_LIST=1 bash /tmp/remote-rollback.sh"
  exit 0
}

$backupArg = if ($BackupName) { " '$(Escape-ShellSingleQuoted $BackupName)'" } else { '' }
Write-Host "==> Rollback: $RemoteDir | PM2: $Pm2App"
if ($BackupName) { Write-Host "==> Backup: $BackupName" } else { Write-Host '==> Backup: latest' }

Invoke-Remote "chmod +x /tmp/remote-rollback.sh && ${envPrefix} bash /tmp/remote-rollback.sh${backupArg}"

Write-Host '==> Verify'
Invoke-Remote "source ~/.nvm/nvm.sh && DEPLOY_REMOTE_DIR='$eRemoteDir' source /tmp/release-lib.sh && release_pm2_verify '$ePm2App'"

Write-Host '==> Rollback finished'
