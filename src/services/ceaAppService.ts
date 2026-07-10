import { Octokit } from '@octokit/rest'
import type { CeaAppManifest, AppInfo } from '../types'
import { createDetectionConfig } from './detectionService'

// Utilise un token GitHub si disponible pour augmenter la limite de rate (5000/h au lieu de 60/h)
// Priorité : localStorage > .env (cohérent avec githubService.ts)
const getGitHubToken = () =>
  localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || undefined

const octokit = new Octokit({
  auth: getGitHubToken()
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
  const logoUrl = manifest.resources?.logo?.url || undefined
  console.log(`[${manifest.app.name}] logo URL: ${logoUrl ?? '(none)'}`)

  return {
    id: manifest.app.id,
    name: manifest.app.name,
    description: manifest.app.description.long,
    shortDescription: manifest.app.description.short,
    repo,
    owner,
    repoUrl: manifest.metadata.repository.url,
    icon: logoUrl,
    category: manifest.metadata.category,
    latestVersion: manifest.app.version,
    latestReleaseDate: manifest.changelog[manifest.app.version]?.date,
    downloadUrl: manifest.installation.downloadUrl,
    releaseNotes: manifest.changelog[manifest.app.version]?.changes.join('\n'),
    detectionConfig: createDetectionConfig(manifest),
  }
}

