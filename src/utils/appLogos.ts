import listxLogo from '../img/apps/listx.svg'
import todoxLogo from '../img/apps/todox.svg'
import autonumLogo from '../img/apps/autonum.svg'
import rendexpressLogo from '../img/apps/rendexpress.svg'
import tontonkadLogo from '../img/apps/tontonkad.svg'

export const APP_LOGOS: Record<string, string> = {
  listx: listxLogo,
  todox: todoxLogo,
  autonum: autonumLogo,
  rendexpress: rendexpressLogo,
  tontonkad: tontonkadLogo,
}

// Fallback vers une icône par défaut si le logo n'existe pas
export function getAppLogo(appId: string): string | undefined {
  return APP_LOGOS[appId]
}

// Couleurs par défaut pour les gradients de fond si pas de logo
export const APP_COLORS: Record<string, { from: string; to: string }> = {
  listx: { from: '#3B82F6', to: '#1E40AF' },       // Bleu
  todox: { from: '#10B981', to: '#059669' },        // Vert
  autonum: { from: '#8B5CF6', to: '#6D28D9' },      // Violet
  rendexpress: { from: '#EC4899', to: '#BE185D' },  // Rose
  tontonkad: { from: '#F59E0B', to: '#D97706' },    // Amber
  caneflow: { from: '#06B6D4', to: '#0E7490' },     // Cyan
  imgflex: { from: '#F97316', to: '#C2410C' },      // Orange-rouge
  rackula: { from: '#6366F1', to: '#4338CA' },      // Indigo
  nexus: { from: '#14B8A6', to: '#0F766E' },        // Teal
}

export function getAppColor(appId: string): { from: string; to: string } {
  return APP_COLORS[appId] || { from: '#6B7280', to: '#4B5563' }
}
