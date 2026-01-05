import { Octokit } from '@octokit/rest'
import type { AppInfo, GitHubRepo, GitHubRelease } from '../types'
import { fetchCeaAppManifestAuto, manifestToAppInfo } from './ceaAppService'

// Utilise un token GitHub si disponible pour augmenter la limite de rate (5000/h au lieu de 60/h)
// Priorité : localStorage > .env
const getGitHubToken = () => {
  return localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || undefined
}

const octokit = new Octokit({
  auth: getGitHubToken()
})

const GITHUB_OWNER = 'Matthmusic'

// Liste des repos à scanner pour les cea-app.json
const REPOS_TO_SCAN = [
  'ListX',
  'To-DoX',
  'AUTONUM',
  'RENDEXPRESS',
  'TONTONKAD',
]

// Fallback: Liste des apps connues (si pas de cea-app.json)
const KNOWN_APPS = [
  {
    id: 'listx',
    repo: 'ListX',
    name: 'ListX',
    category: 'Productivité',
    description: 'Génération et gestion de listings de documents techniques avec exports PDF/Excel',
    shortDescription: 'Génération et gestion de listings de documents techniques'
  },
  {
    id: 'todox',
    repo: 'To-DoX',
    name: 'To-DoX',
    category: 'Productivité',
    description: 'Application Kanban intelligente pour la gestion de tâches avec priorités et deadlines',
    shortDescription: 'Gestion de tâches Kanban avec priorités et deadlines'
  },
  {
    id: 'autonum',
    repo: 'AUTONUM',
    name: 'AUTONUM',
    category: 'Utilitaires',
    description: 'Renommage automatique de fichiers en masse avec numérotation séquentielle',
    shortDescription: 'Renommage automatique de fichiers avec numérotation'
  },
  {
    id: 'rendexpress',
    repo: 'RENDEXPRESS',
    name: 'RENDEXPRESS',
    category: 'Utilitaires',
    description: "Générateur d'arborescence de dossiers avec exports HTML et texte pour emails",
    shortDescription: "Génération d'arborescence pour copier-coller dans les emails"
  },
  {
    id: 'tontonkad',
    repo: 'TONTONKAD',
    name: 'TONTONKAD',
    category: 'Professionnel',
    description: 'Simulation et optimisation de fourreaux électriques multitubulaires',
    shortDescription: 'Dimensionnement de chemins de câbles avec rendu 2D'
  },
]

/**
 * Fetch all public repos from Matthmusic
 */
export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  try {
    const { data } = await octokit.repos.listForUser({
      username: GITHUB_OWNER,
      type: 'all',
      per_page: 100,
    })
    return data as GitHubRepo[]
  } catch (error) {
    console.error('Error fetching repos:', error)
    throw error
  }
}

/**
 * Fetch latest release for a specific repo
 */
export async function fetchLatestRelease(repo: string): Promise<GitHubRelease | null> {
  try {
    const { data } = await octokit.repos.getLatestRelease({
      owner: GITHUB_OWNER,
      repo,
    })
    return data as GitHubRelease
  } catch (error) {
    // No releases found
    if ((error as any).status === 404) {
      return null
    }
    console.error(`Error fetching latest release for ${repo}:`, error)
    throw error
  }
}

/**
 * Build app catalog from GitHub repos using cea-app.json manifests
 * Falls back to hardcoded KNOWN_APPS if manifest not found
 */
export async function buildAppCatalog(): Promise<AppInfo[]> {
  const apps: AppInfo[] = []

  for (const repo of REPOS_TO_SCAN) {
    try {
      // Essaye de récupérer le manifest cea-app.json
      const manifest = await fetchCeaAppManifestAuto(GITHUB_OWNER, repo)

      if (manifest) {
        // Utilise les infos du manifest
        const appInfo = manifestToAppInfo(manifest, GITHUB_OWNER, repo)
        apps.push(appInfo)
        console.log(`✓ Loaded ${repo} from cea-app.json manifest`)
      } else {
        // Fallback: utilise les infos hardcodées + fetch release
        console.warn(`⚠ No cea-app.json found for ${repo}, using fallback`)
        const knownApp = KNOWN_APPS.find(app => app.repo === repo)

        if (knownApp) {
          const release = await fetchLatestRelease(repo)
          const exeAsset = release?.assets.find(asset =>
            asset.name.endsWith('.exe') && !asset.name.includes('blockmap')
          )

          apps.push({
            id: knownApp.id,
            name: knownApp.name,
            description: knownApp.description,
            shortDescription: knownApp.shortDescription,
            repo: knownApp.repo,
            owner: GITHUB_OWNER,
            repoUrl: `https://github.com/${GITHUB_OWNER}/${knownApp.repo}`,
            category: knownApp.category,
            latestVersion: release?.tag_name,
            latestReleaseDate: release?.published_at,
            downloadUrl: exeAsset?.browser_download_url,
            releaseNotes: release?.body,
            fileSize: exeAsset?.size,
          })
        }
      }
    } catch (error) {
      console.error(`Error processing ${repo}:`, error)
      // Ajoute l'app sans infos de release
      const knownApp = KNOWN_APPS.find(app => app.repo === repo)
      if (knownApp) {
        apps.push({
          id: knownApp.id,
          name: knownApp.name,
          description: knownApp.description,
          shortDescription: knownApp.shortDescription,
          repo: knownApp.repo,
          owner: GITHUB_OWNER,
          repoUrl: `https://github.com/${GITHUB_OWNER}/${knownApp.repo}`,
          category: knownApp.category,
        })
      }
    }
  }

  return apps
}

/**
 * Check for updates for a specific app
 */
export async function checkForAppUpdate(repo: string, currentVersion: string): Promise<{
  hasUpdate: boolean
  latestVersion?: string
  downloadUrl?: string
  releaseNotes?: string
}> {
  try {
    const release = await fetchLatestRelease(repo)

    if (!release) {
      return { hasUpdate: false }
    }

    const latestVersion = release.tag_name
    const hasUpdate = latestVersion !== currentVersion

    if (!hasUpdate) {
      return { hasUpdate: false }
    }

    const exeAsset = release.assets.find(asset =>
      asset.name.endsWith('.exe') && !asset.name.includes('blockmap')
    )

    return {
      hasUpdate: true,
      latestVersion,
      downloadUrl: exeAsset?.browser_download_url,
      releaseNotes: release.body,
    }
  } catch (error) {
    console.error(`Error checking update for ${repo}:`, error)
    return { hasUpdate: false }
  }
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A'

  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

/**
 * Format release date
 */
export function formatReleaseDate(dateString?: string): string {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
