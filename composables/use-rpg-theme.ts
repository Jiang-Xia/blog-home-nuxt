/** RPG 语义色 — 与 assets/css/rpg-theme.css 中 --rpg-life-* 保持一致 */
export function getRpgLifeColor(life: number): string {
  if (life > 60) return 'var(--rpg-life-ok)';
  if (life > 30) return 'var(--rpg-life-warn)';
  return 'var(--rpg-life-danger)';
}

export function getRpgFallbackColor(kind: 'neutral' | 'muted' = 'neutral'): string {
  return kind === 'muted' ? 'var(--rpg-text-muted)' : 'var(--rpg-border)';
}
