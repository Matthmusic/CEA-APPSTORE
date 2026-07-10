import type { CeaAppManifest, DetectionConfig } from '../types'

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

