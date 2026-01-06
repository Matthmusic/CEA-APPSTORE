import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AppWithStatus, FilterType } from '../types'
import { buildAppCatalog, checkForAppUpdate } from '../services/githubService'
import * as semver from 'semver'

interface AppStoreContextType {
  apps: AppWithStatus[]
  loading: boolean
  error: string | null
  filter: FilterType
  searchQuery: string
  setFilter: (filter: FilterType) => void
  setSearchQuery: (query: string) => void
  refreshCatalog: () => Promise<void>
  downloadAndInstallApp: (app: AppWithStatus) => Promise<void>
  launchInstalledApp: (app: AppWithStatus) => Promise<void>
  checkForUpdates: () => Promise<void>
  filteredApps: AppWithStatus[]
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined)

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider')
  }
  return context
}

interface AppStoreProviderProps {
  children: ReactNode
}

export function AppStoreProvider({ children }: AppStoreProviderProps) {
  const [apps, setApps] = useState<AppWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load catalog on mount
  useEffect(() => {
    loadCatalog()

    // Setup background update checker (every 30 minutes)
    const interval = setInterval(() => {
      checkForUpdates()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Listen to download progress
  useEffect(() => {
    if (!window.electronAPI) return

    window.electronAPI.onAppDownloadProgress((data) => {
      setApps((prev) =>
        prev.map((app) =>
          app.name === data.appName
            ? {
                ...app,
                isDownloading: true,
                downloadProgress: data.percent,
                downloadSpeed: data.bytesPerSecond
              }
            : app
        )
      )
    })

    return () => {
      window.electronAPI.removeAllListeners('app-download-progress')
    }
  }, [])

  async function loadCatalog() {
    try {
      setLoading(true)
      setError(null)

      // Fetch from GitHub
      const catalog = await buildAppCatalog()

      // Get installed apps
      const installedData = await window.electronAPI.getInstalledApps()

      // Merge data
      const appsWithStatus = await Promise.all(
        catalog.map(async (app) => {
          const installedInfo = installedData.apps[app.id]
          const installed = !!installedInfo

          let canUpdate = false
          if (installed && app.latestVersion && installedInfo.version) {
            // Compare versions using semver
            const current = semver.clean(installedInfo.version)
            const latest = semver.clean(app.latestVersion)

            if (current && latest) {
              canUpdate = semver.gt(latest, current)
              console.log(`[${app.id}] Version check: current=${current}, latest=${latest}, canUpdate=${canUpdate}`)
            } else {
              console.warn(`[${app.id}] Could not clean versions: current=${installedInfo.version}, latest=${app.latestVersion}`)
            }
          }

          return {
            ...app,
            installed,
            currentVersion: installedInfo?.version,
            canUpdate,
            isDownloading: false,
            downloadProgress: 0,
          } as AppWithStatus
        })
      )

      setApps(appsWithStatus)
    } catch (err) {
      console.error('Error loading catalog:', err)
      setError('Impossible de charger le catalogue des applications')
    } finally {
      setLoading(false)
    }
  }

  async function refreshCatalog() {
    await loadCatalog()
  }

  async function checkForUpdates() {
    try {
      const installedData = await window.electronAPI.getInstalledApps()

      const updatedApps = await Promise.all(
        apps.map(async (app) => {
          const installedInfo = installedData.apps[app.id]
          if (!installedInfo || !app.repo) return app

          const updateInfo = await checkForAppUpdate(app.repo, installedInfo.version)

          if (updateInfo.hasUpdate) {
            return {
              ...app,
              latestVersion: updateInfo.latestVersion,
              downloadUrl: updateInfo.downloadUrl,
              releaseNotes: updateInfo.releaseNotes,
              canUpdate: true,
            }
          }

          return app
        })
      )

      setApps(updatedApps)
    } catch (err) {
      console.error('Error checking for updates:', err)
    }
  }

  async function downloadAndInstallApp(app: AppWithStatus) {
    if (!app.downloadUrl) {
      setError('URL de téléchargement introuvable')
      return
    }

    try {
      setError(null)

      // Mark as downloading
      setApps((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, isDownloading: true, downloadProgress: 0 } : a
        )
      )

      // Download
      const result = await window.electronAPI.downloadApp(app.downloadUrl, app.name)

      if (!result.success || !result.filePath) {
        throw new Error(result.error || 'Échec du téléchargement')
      }

      // Install
      const installResult = await window.electronAPI.installApp(result.filePath)

      if (!installResult.success) {
        throw new Error(installResult.error || "Échec de l'installation")
      }

      // Save to installed apps
      await window.electronAPI.saveInstalledApp({
        id: app.id,
        version: app.latestVersion || 'unknown',
      })

      // Update state
      setApps((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? {
                ...a,
                installed: true,
                currentVersion: app.latestVersion,
                canUpdate: false,
                isDownloading: false,
                downloadProgress: 100,
              }
            : a
        )
      )
    } catch (err) {
      console.error('Error downloading/installing app:', err)
      setError(`Erreur: ${(err as Error).message}`)

      // Reset downloading state
      setApps((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, isDownloading: false, downloadProgress: 0 } : a
        )
      )
    }
  }

  async function launchInstalledApp(app: AppWithStatus) {
    try {
      setError(null)
      const result = await window.electronAPI.launchApp({
        id: app.id,
        name: app.name,
        detectionConfig: app.detectionConfig,
      })
      if (!result.success) {
        throw new Error(result.error || "Echec du lancement de l'application")
      }
    } catch (err) {
      console.error('Error launching app:', err)
      setError(`Erreur: ${(err as Error).message}`)
    }
  }

  // Filter apps
  const filteredApps = apps
    .filter((app) => {
      // Apply filter
      if (filter === 'installed' && !app.installed) return false
      if (filter === 'updates' && !app.canUpdate) return false

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.category.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))

  const value: AppStoreContextType = {
    apps,
    loading,
    error,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    refreshCatalog,
    downloadAndInstallApp,
    launchInstalledApp,
    checkForUpdates,
    filteredApps,
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}
