// Map d'icônes par défaut pour chaque app
// Les utilisateurs peuvent ajouter leurs propres logos dans src/img/apps/

export const APP_LOGOS: Record<string, string> = {
  listx: '/src/img/apps/listx.svg',
  todox: '/src/img/apps/todox.svg',
  autonum: '/src/img/apps/autonum.svg',
  rendexpress: '/src/img/apps/rendexpress.svg',
  tontonkad: '/src/img/apps/tontonkad.svg',
}

// Fallback vers une icône par défaut si le logo n'existe pas
export function getAppLogo(appId: string): string | undefined {
  return APP_LOGOS[appId]
}

// Couleurs par défaut pour les gradients de fond si pas de logo
export const APP_COLORS: Record<string, { from: string; to: string }> = {
  listx: { from: '#3B82F6', to: '#1E40AF' },       // Bleu
  todox: { from: '#10B981', to: '#059669' },       // Vert
  autonum: { from: '#8B5CF6', to: '#6D28D9' },     // Violet
  rendexpress: { from: '#EC4899', to: '#BE185D' }, // Rose
  tontonkad: { from: '#F59E0B', to: '#D97706' },   // Amber/Orange
}

export function getAppColor(appId: string): { from: string; to: string } {
  return APP_COLORS[appId] || { from: '#6B7280', to: '#4B5563' }
}
