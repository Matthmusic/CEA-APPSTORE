const { app, BrowserWindow, ipcMain, nativeTheme, shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const axios = require('axios')

// Configuration
nativeTheme.themeSource = 'dark'
let mainWindow = null

// Paths
const userDataPath = app.getPath('userData')
const installedAppsPath = path.join(userDataPath, 'installed-apps.json')

const appNameMapping = {
  'listx': 'listx',
  'todox': 'todox',
  'to-dox': 'todox',
  'smart-todo': 'todox',  // To-DoX s'installe comme "Smart-ToDo"
  'autonum': 'autonum',
  'rendexpress': 'rendexpress',
  'tontonkad': 'tontonkad',
}

// ============================================
// WINDOW CREATION
// ============================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 600,
    frame: false, // Custom title bar
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  // Load app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5588')
    mainWindow.webContents.openDevTools()
  }

  // Window controls
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ============================================
// ELECTRON APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
  createWindow()

  // Check for updates after 3 seconds (production only)
  setTimeout(() => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdates()
    }
  }, 3000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============================================
// AUTO-UPDATER CONFIGURATION
// ============================================

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', {
    version: info.version,
    releaseDate: info.releaseDate,
    releaseNotes: info.releaseNotes,
  })
})

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('download-progress', {
    percent: progressObj.percent,
    transferred: progressObj.transferred,
    total: progressObj.total,
    bytesPerSecond: progressObj.bytesPerSecond,
  })
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded')
})

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('update-error', error.message)
})

// ============================================
// IPC HANDLERS - APP STORE UPDATES
// ============================================

ipcMain.handle('check-for-updates', async () => {
  if (app.isPackaged) {
    return await autoUpdater.checkForUpdates()
  }
  return null
})

ipcMain.on('download-update', () => {
  if (!autoUpdater) {
    console.error('AutoUpdater not initialized')
    return
  }
  console.log('Starting update download...')
  autoUpdater.downloadUpdate()
})

ipcMain.on('install-update', () => {
  if (!autoUpdater) {
    console.error('AutoUpdater not initialized')
    return
  }
  console.log('Quitting and installing update...')
  autoUpdater.quitAndInstall()
})

// ============================================
// IPC HANDLERS - WINDOW CONTROLS
// ============================================

ipcMain.handle('window-minimize', () => {
  mainWindow.minimize()
})

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
  return mainWindow.isMaximized()
})

ipcMain.handle('window-close', () => {
  mainWindow.close()
})

// ============================================
// IPC HANDLERS - INSTALLED APPS TRACKING
// ============================================

/**
 * Check if an app is really installed on Windows by checking the registry
 * @param {string} appName - Name of the app to check
 * @returns {Promise<{installed: boolean, version?: string, displayName?: string}>}
 */
async function checkWindowsInstallation(appName) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve({ installed: false })
      return
    }

    // Search in Windows Registry for installed apps
    const registryPaths = [
      'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    ]

    let foundApp = null

    // Check each registry path
    const checkPath = (pathIndex) => {
      if (pathIndex >= registryPaths.length) {
        resolve(foundApp || { installed: false })
        return
      }

      const regPath = registryPaths[pathIndex]

      // Use reg query to search the registry
      const regQuery = spawn('reg', ['query', regPath, '/s', '/f', appName, '/d'], {
        windowsHide: true,
      })

      let output = ''

      regQuery.stdout.on('data', (data) => {
        output += data.toString()
      })

      regQuery.on('close', (code) => {
        // Parse the output to find DisplayName and DisplayVersion
        const lines = output.split('\n')
        let currentKey = null
        let displayName = null
        let displayVersion = null
        let installLocation = null
        let displayIcon = null

        for (const line of lines) {
          // Detect registry key
          if (line.includes('HKEY_')) {
            currentKey = line.trim()
            displayName = null
            displayVersion = null
          }

          // Extract DisplayName
          if (line.includes('DisplayName') && line.includes('REG_SZ')) {
            const match = line.match(/DisplayName\s+REG_SZ\s+(.+)/)
            if (match) {
              displayName = match[1].trim()
            }
          }

          // Extract DisplayVersion
          if (line.includes('DisplayVersion') && line.includes('REG_SZ')) {
            const match = line.match(/DisplayVersion\s+REG_SZ\s+(.+)/)
            if (match) {
              displayVersion = match[1].trim()
            }
          }

          if (line.includes('InstallLocation') && line.includes('REG_SZ')) {
            const match = line.match(/InstallLocation\s+REG_SZ\s+(.+)/)
            if (match) {
              installLocation = match[1].trim()
            }
          }

          if (line.includes('DisplayIcon') && line.includes('REG_SZ')) {
            const match = line.match(/DisplayIcon\s+REG_SZ\s+(.+)/)
            if (match) {
              displayIcon = match[1].trim()
            }
          }

          // If we found a matching app
          if (displayName && displayName.toLowerCase().includes(appName.toLowerCase())) {
            foundApp = {
              installed: true,
              version: displayVersion,
              displayName: displayName,
              installLocation: installLocation,
              displayIcon: displayIcon,
            }
            // Continue searching to get the most recent version if multiple entries
          }
        }

        // Check next path
        checkPath(pathIndex + 1)
      })

      regQuery.on('error', () => {
        // Error, try next path
        checkPath(pathIndex + 1)
      })
    }

    checkPath(0)
  })
}

function checkAppDataInstallation(appId) {
  if (process.platform !== 'win32') {
    return { installed: false }
  }

  const appDataRoot = app.getPath('appData')
  const appDataMap = {
    todox: path.join(appDataRoot, 'To-DoX'),
  }

  const installPath = appDataMap[appId]
  if (!installPath) {
    return { installed: false }
  }

  if (fs.existsSync(installPath)) {
    return {
      installed: true,
      displayName: 'To-DoX',
      version: null,
      installPath,
    }
  }

  return { installed: false }
}

function normalizeRegistryPath(value) {
  if (!value) return null
  let cleaned = value.trim().replace(/^"+|"+$/g, '')
  const commaIndex = cleaned.indexOf(',')
  if (commaIndex !== -1) {
    cleaned = cleaned.slice(0, commaIndex)
  }
  return cleaned
}

function findExecutableInDirectory(directory, appName, appId) {
  if (!directory || !fs.existsSync(directory)) return null

  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const exeFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.exe'))
    .map((entry) => entry.name)

  if (!exeFiles.length) return null

  const lowerName = (appName || '').toLowerCase().replace(/\s+/g, '')
  const lowerId = (appId || '').toLowerCase()
  const preferred = exeFiles.find((name) => {
    const normalized = name.toLowerCase()
    return normalized.includes(lowerName) || normalized.includes(lowerId)
  })

  const withoutUninstall = exeFiles.find((name) => {
    const normalized = name.toLowerCase()
    return !normalized.includes('uninstall') && !normalized.includes('unins')
  })

  const selected = preferred || withoutUninstall || exeFiles[0]
  return path.join(directory, selected)
}

function getSearchNamesForApp(appId, appName) {
  const names = new Set([appId, appName].filter(Boolean))
  for (const [searchName, canonicalId] of Object.entries(appNameMapping)) {
    if (canonicalId === appId) {
      names.add(searchName)
    }
  }
  return Array.from(names)
}

async function resolveLaunchPath(appId, appName) {
  if (process.platform !== 'win32') return null

  const searchNames = getSearchNamesForApp(appId, appName)
  for (const name of searchNames) {
    const registryCheck = await checkWindowsInstallation(name)
    if (!registryCheck.installed) continue

    const displayIcon = normalizeRegistryPath(registryCheck.displayIcon)
    if (displayIcon && displayIcon.toLowerCase().endsWith('.exe') && fs.existsSync(displayIcon)) {
      return displayIcon
    }

    const installLocation = normalizeRegistryPath(registryCheck.installLocation)
    const exeFromInstall = findExecutableInDirectory(installLocation, appName, appId)
    if (exeFromInstall) return exeFromInstall
  }

  const appDataCheck = checkAppDataInstallation(appId)
  if (appDataCheck.installed) {
    const exeFromAppData = findExecutableInDirectory(appDataCheck.installPath, appName, appId)
    if (exeFromAppData) return exeFromAppData
  }

  return null
}

ipcMain.handle('get-installed-apps', async () => {
  try {
    let installedApps = { apps: {} }

    // Read our tracking file
    if (fs.existsSync(installedAppsPath)) {
      const data = fs.readFileSync(installedAppsPath, 'utf-8')
      installedApps = JSON.parse(data)
    }

    const verifiedApps = {}

    // 1. Verify tracked apps are still installed
    for (const [appId, appInfo] of Object.entries(installedApps.apps)) {
      const windowsCheck = await checkWindowsInstallation(appId)
      const fileCheck = windowsCheck.installed ? null : checkAppDataInstallation(appId)
      const installCheck = windowsCheck.installed ? windowsCheck : fileCheck

      if (installCheck && installCheck.installed) {
        // Try to extract version from DisplayName if DisplayVersion is missing
        let detectedVersion = installCheck.version
        if (!detectedVersion && installCheck.displayName) {
          // Extract version from "AppName 1.2.3" format
          const versionMatch = installCheck.displayName.match(/(\d+\.\d+\.\d+)/)
          detectedVersion = versionMatch ? versionMatch[1] : null
        }
        detectedVersion = detectedVersion || appInfo.version || 'unknown'

        console.log(`[${appId}] Detected version: ${detectedVersion} (from ${installCheck.version ? 'registry DisplayVersion' : detectedVersion !== 'unknown' ? 'DisplayName' : 'cache'})`)
        verifiedApps[appId] = {
          ...appInfo,
          version: detectedVersion,
          displayName: installCheck.displayName || appInfo.displayName,
          lastChecked: new Date().toISOString(),
        }
      } else {
        console.log(`App ${appId} was tracked but not found in Windows registry - removing`)
      }
    }

    // 2. Check for apps installed manually (not via AppStore)
    for (const [searchName, canonicalId] of Object.entries(appNameMapping)) {
      // Skip if we already have the canonical ID tracked
      if (verifiedApps[canonicalId]) continue

      const windowsCheck = await checkWindowsInstallation(searchName)
      const fileCheck = windowsCheck.installed ? null : checkAppDataInstallation(canonicalId)
      const installCheck = windowsCheck.installed ? windowsCheck : fileCheck

      if (installCheck && installCheck.installed) {
        // Try to extract version from DisplayName if DisplayVersion is missing
        let detectedVersion = installCheck.version
        if (!detectedVersion && installCheck.displayName) {
          // Extract version from "AppName 1.2.3" format
          const versionMatch = installCheck.displayName.match(/(\d+\.\d+\.\d+)/)
          detectedVersion = versionMatch ? versionMatch[1] : null
        }
        detectedVersion = detectedVersion || 'unknown'

        console.log(`Found ${searchName} (${canonicalId}) installed manually (not via AppStore) - adding to tracked apps`)
        verifiedApps[canonicalId] = {
          version: detectedVersion,
          displayName: installCheck.displayName,
          installedAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          manualInstall: true,
        }
        // Stop searching other aliases for this app
        break
      }
    }

    // Update the file with verified apps
    installedApps.apps = verifiedApps
    fs.writeFileSync(installedAppsPath, JSON.stringify(installedApps, null, 2))

    return { apps: verifiedApps }
  } catch (error) {
    console.error('Error reading installed apps:', error)
    return { apps: {} }
  }
})

ipcMain.handle('save-installed-app', (event, appData) => {
  try {
    let installedApps = { apps: {} }

    if (fs.existsSync(installedAppsPath)) {
      const data = fs.readFileSync(installedAppsPath, 'utf-8')
      installedApps = JSON.parse(data)
    }

    installedApps.apps[appData.id] = {
      version: appData.version,
      installedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    }

    fs.writeFileSync(installedAppsPath, JSON.stringify(installedApps, null, 2))
    return { success: true }
  } catch (error) {
    console.error('Error saving installed app:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('remove-installed-app', (event, appId) => {
  try {
    if (fs.existsSync(installedAppsPath)) {
      const data = fs.readFileSync(installedAppsPath, 'utf-8')
      const installedApps = JSON.parse(data)

      delete installedApps.apps[appId]

      fs.writeFileSync(installedAppsPath, JSON.stringify(installedApps, null, 2))
      return { success: true }
    }
    return { success: false, error: 'File not found' }
  } catch (error) {
    console.error('Error removing installed app:', error)
    return { success: false, error: error.message }
  }
})

// ============================================
// IPC HANDLERS - APP DOWNLOAD & INSTALL
// ============================================

ipcMain.handle('download-app', async (event, downloadUrl, appName) => {
  try {
    const tempDir = app.getPath('temp')
    const fileName = `${appName}-installer.exe`
    const filePath = path.join(tempDir, fileName)

    // Configuration optimisée pour améliorer les performances
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 300000, // 5 minutes timeout
      maxRedirects: 5,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'CEA-AppStore/1.0.0',
      },
      // Optimisation de la connection
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    const totalSize = parseInt(response.headers['content-length'], 10)
    let downloadedSize = 0
    let lastProgressUpdate = Date.now()
    let lastDownloadedSize = 0

    const writer = fs.createWriteStream(filePath)

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length
      const progress = (downloadedSize / totalSize) * 100
      const now = Date.now()

      // Envoie les mises à jour de progression toutes les 100ms pour éviter de surcharger l'UI
      if (now - lastProgressUpdate > 100) {
        const bytesPerSecond = ((downloadedSize - lastDownloadedSize) / (now - lastProgressUpdate)) * 1000

        mainWindow.webContents.send('app-download-progress', {
          appName,
          percent: progress,
          downloaded: downloadedSize,
          total: totalSize,
          bytesPerSecond: Math.round(bytesPerSecond),
        })

        lastProgressUpdate = now
        lastDownloadedSize = downloadedSize
      }
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve({ success: true, filePath })
      })
      writer.on('error', (error) => {
        // Nettoyage en cas d'erreur
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        reject({ success: false, error: error.message })
      })
    })
  } catch (error) {
    console.error('Error downloading app:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('install-app', async (event, exePath) => {
  try {
    // Launch installer automatically
    spawn(exePath, [], {
      detached: true,
      stdio: 'ignore',
    }).unref()

    return { success: true }
  } catch (error) {
    console.error('Error installing app:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('launch-app', async (event, appData) => {
  try {
    const exePath = await resolveLaunchPath(appData?.id, appData?.name)
    if (!exePath) {
      return { success: false, error: 'Executable introuvable' }
    }

    const openError = await shell.openPath(exePath)
    if (openError) {
      return { success: false, error: openError }
    }

    return { success: true }
  } catch (error) {
    console.error('Error launching app:', error)
    return { success: false, error: error.message }
  }
})

// Open external links
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url)
})

// ============================================
// APP INFO
// ============================================

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-user-data-path', () => {
  return userDataPath
})

// ============================================
// DETECTION SERVICE - CEA APP MANIFEST
// ============================================

/**
 * Check if app is installed based on CEA App Manifest detection config
 */
ipcMain.handle('check-app-installation', async (event, detectionConfig) => {
  try {
    const { priority, files, directories, registry } = detectionConfig

    // Helper to expand environment variables
    const expandPath = (pathStr) => {
      return pathStr
        .replace(/%APPDATA%/gi, app.getPath('appData'))
        .replace(/%LOCALAPPDATA%/gi, app.getPath('userData').replace(/[^\\]+$/, ''))
        .replace(/%PROGRAMFILES%/gi, process.env.PROGRAMFILES || 'C:\\Program Files')
        .replace(/%PROGRAMFILES\(X86\)%/gi, process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)')
        .replace(/%USERPROFILE%/gi, app.getPath('home'))
        .replace(/%TEMP%/gi, app.getPath('temp'))
    }

    // Check files
    const checkFiles = () => {
      if (!files || files.length === 0) return null

      for (const fileObj of files) {
        const expandedPath = expandPath(fileObj.path)
        if (fs.existsSync(expandedPath)) {
          return {
            isInstalled: true,
            detectedPath: expandedPath,
            detectionMethod: 'file',
          }
        }
      }
      return null
    }

    // Check directories
    const checkDirectories = () => {
      if (!directories || directories.length === 0) return null

      for (const dirObj of directories) {
        const expandedPath = expandPath(dirObj.path)
        if (fs.existsSync(expandedPath)) {
          return {
            isInstalled: true,
            detectedPath: expandedPath,
            detectionMethod: 'directory',
          }
        }
      }
      return null
    }

    // Check registry (Windows only)
    const checkRegistry = () => {
      return new Promise((resolve) => {
        if (process.platform !== 'win32' || !registry || registry.length === 0) {
          resolve(null)
          return
        }

        let foundEntry = null
        let checkedCount = 0

        for (const regObj of registry) {
          const keyPath = regObj.key
          const valueName = regObj.value || ''

          // Parse registry key
          const regQuery = spawn('reg', ['query', keyPath, valueName ? '/v' : '', valueName].filter(Boolean), {
            windowsHide: true,
          })

          let output = ''

          regQuery.stdout.on('data', (data) => {
            output += data.toString()
          })

          regQuery.on('close', (code) => {
            checkedCount++

            if (code === 0 && output.trim()) {
              // Registry key exists
              foundEntry = {
                isInstalled: true,
                detectedPath: keyPath,
                detectionMethod: 'registry',
              }
            }

            // Resolve when all checks are done
            if (checkedCount === registry.length) {
              resolve(foundEntry)
            }
          })

          regQuery.on('error', () => {
            checkedCount++
            if (checkedCount === registry.length) {
              resolve(foundEntry)
            }
          })
        }
      })
    }

    // Check based on priority
    let result = null

    if (priority === 'files') {
      result = checkFiles() || checkDirectories() || (await checkRegistry())
    } else if (priority === 'directories') {
      result = checkDirectories() || checkFiles() || (await checkRegistry())
    } else if (priority === 'registry') {
      result = (await checkRegistry()) || checkFiles() || checkDirectories()
    }

    return result || { isInstalled: false }
  } catch (error) {
    console.error('Error checking app installation:', error)
    return { isInstalled: false, error: error.message }
  }
})
