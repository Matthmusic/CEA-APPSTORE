const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App Store Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  // Update events listeners
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_, data) => callback(data)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_, error) => callback(error)),

  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // Installed apps tracking
  getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
  saveInstalledApp: (appData) => ipcRenderer.invoke('save-installed-app', appData),
  removeInstalledApp: (appId) => ipcRenderer.invoke('remove-installed-app', appId),

  // App download & install
  downloadApp: (downloadUrl, appName) => ipcRenderer.invoke('download-app', downloadUrl, appName),
  installApp: (exePath) => ipcRenderer.invoke('install-app', exePath),
  onAppDownloadProgress: (callback) => ipcRenderer.on('app-download-progress', (_, data) => callback(data)),
  launchApp: (appData) => ipcRenderer.invoke('launch-app', appData),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // CEA App Manifest detection
  checkAppInstallation: (detectionConfig) => ipcRenderer.invoke('check-app-installation', detectionConfig),

  // Cleanup
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
})
