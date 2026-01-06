import type { CeaAppManifest, DetectionConfig } from '../types'

/**
 * Check if an app is installed on the system based on manifest detection rules
 * This function runs in the renderer and needs to communicate with Electron main process
 */
export interface DetectionResult {
  isInstalled: boolean
  detectedPath?: string
  detectionMethod?: 'file' | 'directory' | 'registry'
}

/**
 * Expand environment variables in paths
 */
export function expandEnvPath(path: string): string {
  // Variables Windows courantes
  const envVars: Record<string, string> = {
    '%APPDATA%': process.env.APPDATA || '',
    '%LOCALAPPDATA%': process.env.LOCALAPPDATA || '',
    '%PROGRAMFILES%': process.env.PROGRAMFILES || 'C:\\Program Files',
    '%PROGRAMFILES(X86)%': process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)',
    '%USERPROFILE%': process.env.USERPROFILE || '',
    '%HOMEDRIVE%': process.env.HOMEDRIVE || 'C:',
    '%HOMEPATH%': process.env.HOMEPATH || '',
    '%SYSTEMROOT%': process.env.SYSTEMROOT || 'C:\\Windows',
    '%TEMP%': process.env.TEMP || '',
    '%TMP%': process.env.TMP || '',
  }

  let expandedPath = path
  for (const [varName, varValue] of Object.entries(envVars)) {
    if (expandedPath.includes(varName)) {
      expandedPath = expandedPath.replace(new RegExp(varName, 'gi'), varValue)
    }
  }

  return expandedPath
}

/**
 * Create detection config from manifest for Electron IPC
 */
export function createDetectionConfig(manifest: CeaAppManifest): DetectionConfig {
  const { detection } = manifest

  return {
    priority: detection.priority,
    files: detection.windows.files || [],
    directories: detection.windows.directories || [],
    registry: detection.windows.registry || [],
  }
}

/**
 * Validate detection paths (for manifest validation)
 */
export function validateDetectionPaths(manifest: CeaAppManifest): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const { detection } = manifest

  // Vérifie qu'au moins une méthode de détection est fournie
  const hasFiles = detection.windows.files && detection.windows.files.length > 0
  const hasDirs = detection.windows.directories && detection.windows.directories.length > 0
  const hasRegistry = detection.windows.registry && detection.windows.registry.length > 0

  if (!hasFiles && !hasDirs && !hasRegistry) {
    errors.push('Au moins une méthode de détection (files, directories, registry) doit être fournie')
  }

  // Valide les chemins de fichiers
  if (detection.windows.files) {
    detection.windows.files.forEach((file, idx) => {
      if (!file.path || file.path.trim() === '') {
        errors.push(`detection.windows.files[${idx}]: path est requis`)
      }
    })
  }

  // Valide les chemins de dossiers
  if (detection.windows.directories) {
    detection.windows.directories.forEach((dir, idx) => {
      if (!dir.path || dir.path.trim() === '') {
        errors.push(`detection.windows.directories[${idx}]: path est requis`)
      }
    })
  }

  // Valide les clés de registre
  if (detection.windows.registry) {
    detection.windows.registry.forEach((reg, idx) => {
      if (!reg.key || reg.key.trim() === '') {
        errors.push(`detection.windows.registry[${idx}]: key est requis`)
      }
      // Vérifie que la clé commence par une ruche valide
      const validHives = ['HKEY_LOCAL_MACHINE', 'HKEY_CURRENT_USER', 'HKEY_CLASSES_ROOT', 'HKEY_USERS', 'HKEY_CURRENT_CONFIG']
      const startsWithValidHive = validHives.some(hive => reg.key.startsWith(hive))
      if (!startsWithValidHive) {
        errors.push(`detection.windows.registry[${idx}]: key doit commencer par une ruche valide (HKEY_*)`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get user-friendly detection summary
 */
export function getDetectionSummary(manifest: CeaAppManifest): string {
  const { detection } = manifest
  const methods: string[] = []

  if (detection.windows.files && detection.windows.files.length > 0) {
    methods.push(`${detection.windows.files.length} fichier(s)`)
  }

  if (detection.windows.directories && detection.windows.directories.length > 0) {
    methods.push(`${detection.windows.directories.length} dossier(s)`)
  }

  if (detection.windows.registry && detection.windows.registry.length > 0) {
    methods.push(`${detection.windows.registry.length} clé(s) registre`)
  }

  return `Détection par: ${methods.join(', ')} (priorité: ${detection.priority})`
}
