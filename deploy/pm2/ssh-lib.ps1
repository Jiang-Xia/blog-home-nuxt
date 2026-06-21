# 本地 deploy/rollback 共用：防 SSH 远程 shell 注入

function Escape-ShellSingleQuoted {
  param([AllowNull()][string]$Value)
  if ($null -eq $Value) { return '' }
  if (-not $Value.Contains([char]39)) { return $Value }
  $sq = [string][char]39
  $bashEscapedSq = $sq + [string][char]92 + $sq + $sq
  return $Value.Replace($sq, $bashEscapedSq)
}

function Assert-BackupFileName {
  param([string]$Name)
  if (-not $Name) { return }
  if ($Name -notmatch '^backup-\d{8}-\d{6}\.tar\.gz$') {
    throw "Invalid backup name (expected backup-YYYYMMDD-HHMMSS.tar.gz): $Name"
  }
}

function Assert-SafeTarName {
  param([string]$Name)
  if ($Name -match '[/\\]' -or $Name -match '\.\.') {
    throw "Invalid DEPLOY_TAR_NAME (must be a plain filename): $Name"
  }
}
