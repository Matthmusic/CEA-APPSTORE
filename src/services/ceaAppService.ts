import { Octokit } from '@octokit/rest'
import type { CeaAppManifest, AppInfo } from '../types'
import { createDetectionConfig } from './detectionService'

// Utilise un token GitHub si disponible pour augmenter la limite de rate (5000/h au lieu de 60/h)
const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN || undefined
})

/**
 * Fetch cea-app.json from a GitHub repository
 */
export async function fetchCeaAppManifest(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<CeaAppManifest | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'cea-app.json',
      ref: branch,
    })

    // Vérifie que c'est un fichier (pas un dossier)
    if ('content' in data && data.type === 'file') {
      // Utilise atob() pour décoder base64 dans le navigateur au lieu de Buffer
      // Enlève les retours à la ligne du contenu base64 de GitHub
      const base64Content = data.content.replace(/\n/g, '')
      const decodedContent = atob(base64Content)
      // Décode l'UTF-8 correctement
      const content = new TextDecoder('utf-8').decode(
        new Uint8Array([...decodedContent].map(char => char.charCodeAt(0)))
      )
      const manifest: CeaAppManifest = JSON.parse(content)
      return manifest
    }

    return null
  } catch (error) {
    // Fichier non trouvé ou erreur
    if ((error as any).status === 404) {
      console.warn(`cea-app.json not found in ${owner}/${repo}`)
      return null
    }
    console.error(`Error fetching cea-app.json from ${owner}/${repo}:`, error)
    throw error
  }
}

/**
 * Try to fetch from main or master branch
 */
export async function fetchCeaAppManifestAuto(
  owner: string,
  repo: string
): Promise<CeaAppManifest | null> {
  // Essaye d'abord main
  let manifest = await fetchCeaAppManifest(owner, repo, 'main')

  // Si pas trouvé, essaye master
  if (!manifest) {
    manifest = await fetchCeaAppManifest(owner, repo, 'master')
  }

  return manifest
}

/**
 * Convert CEA App Manifest to AppInfo
 */
export function manifestToAppInfo(
  manifest: CeaAppManifest,
  owner: string,
  repo: string
): AppInfo {
  return {
    id: manifest.app.id,
    name: manifest.app.name,
    description: manifest.app.description.long,
    shortDescription: manifest.app.description.short,
    repo,
    owner,
    repoUrl: manifest.metadata.repository.url,
    icon: manifest.resources.logo.url,
    category: manifest.metadata.category,
    latestVersion: manifest.app.version,
    latestReleaseDate: manifest.changelog[manifest.app.version]?.date,
    downloadUrl: manifest.installation.downloadUrl,
    releaseNotes: manifest.changelog[manifest.app.version]?.changes.join('\n'),
    detectionConfig: createDetectionConfig(manifest),
  }
}

/**
 * Build app catalog from repositories with cea-app.json
 */
export async function buildCatalogFromManifests(
  repositories: Array<{ owner: string; repo: string }>
): Promise<AppInfo[]> {
  const apps: AppInfo[] = []

  for (const { owner, repo } of repositories) {
    try {
      const manifest = await fetchCeaAppManifestAuto(owner, repo)

      if (manifest) {
        const appInfo = manifestToAppInfo(manifest, owner, repo)
        apps.push(appInfo)
      } else {
        console.warn(`Skipping ${owner}/${repo}: no cea-app.json found`)
      }
    } catch (error) {
      console.error(`Error processing ${owner}/${repo}:`, error)
    }
  }

  return apps
}

/**
 * Validate CEA App Manifest structure
 */
export function validateManifest(manifest: any): manifest is CeaAppManifest {
  try {
    return (
      typeof manifest === 'object' &&
      manifest.app &&
      typeof manifest.app.id === 'string' &&
      typeof manifest.app.name === 'string' &&
      typeof manifest.app.version === 'string' &&
      manifest.app.description &&
      typeof manifest.app.description.short === 'string' &&
      typeof manifest.app.description.long === 'string' &&
      manifest.resources &&
      manifest.resources.logo &&
      typeof manifest.resources.logo.url === 'string' &&
      manifest.detection &&
      manifest.metadata &&
      manifest.installation &&
      typeof manifest.installation.downloadUrl === 'string'
    )
  } catch {
    return false
  }
}

/**
 * Get app changelog from manifest
 */
export function getChangelog(manifest: CeaAppManifest): Array<{
  version: string
  date: string
  changes: string[]
}> {
  return Object.entries(manifest.changelog)
    .map(([version, info]) => ({
      version,
      date: info.date,
      changes: info.changes,
    }))
    .sort((a, b) => {
      // Tri décroissant par version
      return b.version.localeCompare(a.version, undefined, { numeric: true })
    })
}
