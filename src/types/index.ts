export interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  published_at: string
  assets: GitHubAsset[]
}

export interface GitHubAsset {
  id: number
  name: string
  size: number
  browser_download_url: string
  content_type: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  topics: string[]
  updated_at: string
  private: boolean
}

export interface AppInfo {
  id: string
  name: string
  description: string
  shortDescription?: string
  repo: string
  owner: string
  repoUrl: string
  icon?: string
  category: string
  latestVersion?: string
  latestReleaseDate?: string
  downloadUrl?: string
  releaseNotes?: string
  fileSize?: number
  detectionConfig?: DetectionConfig
}

export interface InstalledApp {
  version: string
  installedAt: string
  lastChecked: string
}

export interface InstalledAppsData {
  apps: Record<string, InstalledApp>
}

export interface AppWithStatus extends AppInfo {
  installed: boolean
  currentVersion?: string
  canUpdate: boolean
  isDownloading: boolean
  downloadProgress: number
  downloadSpeed?: number
}

export interface DownloadProgress {
  appName: string
  percent: number
  downloaded: number
  total: number
  bytesPerSecond?: number
}

export interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes: string
}

export type FilterType = 'all' | 'installed' | 'updates'

export interface DetectionConfig {
  priority: 'files' | 'directories' | 'registry'
  files: Array<{ path: string; description?: string }>
  directories: Array<{ path: string; description?: string }>
  registry?: Array<{ key: string; value?: string; description?: string }>
}

// CEA App Manifest Types
export interface CeaAppManifest {
  $schema?: string
  version: string
  app: {
    id: string
    name: string
    version: string
    description: {
      short: string
      long: string
    }
  }
  resources: {
    logo: {
      path: string
      url: string
    }
    icon?: {
      path: string
      url: string
    }
    screenshots?: Array<{
      path: string
      url: string
      caption?: string
    }>
  }
  detection: {
    windows: {
      files?: Array<{
        path: string
        description?: string
      }>
      directories?: Array<{
        path: string
        description?: string
      }>
      registry?: Array<{
        key: string
        value?: string
        description?: string
      }>
    }
    priority: 'files' | 'directories' | 'registry'
  }
  metadata: {
    author: {
      name: string
      email?: string
      url?: string
    }
    category: string
    tags: string[]
    repository: {
      type: string
      url: string
      branch: string
    }
    homepage?: string
    documentation?: string
    license: string
    compatibility?: {
      os: string[]
      minVersion?: string
    }
  }
  installation: {
    type: 'installer' | 'portable' | 'script'
    downloadUrl: string
    installCommand?: string
    uninstallCommand?: string
  }
  changelog: Record<string, {
    date: string
    changes: string[]
  }>
}

// Electron API Types
export interface ElectronAPI {
  // App Store Updates
  checkForUpdates: () => Promise<any>
  downloadUpdate: () => Promise<any>
  installUpdate: () => void

  // Update events
  onUpdateAvailable: (callback: (data: UpdateInfo) => void) => void
  onDownloadProgress: (callback: (data: any) => void) => void
  onUpdateDownloaded: (callback: () => void) => void
  onUpdateError: (callback: (error: string) => void) => void

  // Window controls
  windowMinimize: () => Promise<void>
  windowMaximize: () => Promise<boolean>
  windowClose: () => Promise<void>

  // Installed apps
  getInstalledApps: () => Promise<InstalledAppsData>
  saveInstalledApp: (appData: { id: string; version: string }) => Promise<{ success: boolean; error?: string }>
  removeInstalledApp: (appId: string) => Promise<{ success: boolean; error?: string }>

  // Download & install
  downloadApp: (downloadUrl: string, appName: string) => Promise<{ success: boolean; filePath?: string; error?: string }>
  installApp: (exePath: string) => Promise<{ success: boolean; error?: string }>
  onAppDownloadProgress: (callback: (data: DownloadProgress) => void) => void
  launchApp: (appData: { id: string; name: string; detectionConfig?: DetectionConfig }) => Promise<{ success: boolean; error?: string }>

  // External
  openExternal: (url: string) => Promise<void>

  // App info
  getAppVersion: () => Promise<string>
  getUserDataPath: () => Promise<string>

  // CEA App Manifest detection
  checkAppInstallation: (detectionConfig: DetectionConfig) => Promise<{
    isInstalled: boolean
    detectedPath?: string
    detectionMethod?: 'file' | 'directory' | 'registry'
    error?: string
  }>

  // Cleanup
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
