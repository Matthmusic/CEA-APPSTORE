import { useState, useEffect } from 'react'
import { Download, X, RefreshCw } from 'lucide-react'
import type { UpdateInfo } from '../types'

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!window.electronAPI) return

    // Update available
    window.electronAPI.onUpdateAvailable((info) => {
      setUpdateAvailable(true)
      setUpdateInfo(info)
    })

    // Download progress
    window.electronAPI.onDownloadProgress((progress) => {
      setDownloading(true)
      setDownloadProgress(Math.round(progress.percent))
    })

    // Update downloaded
    window.electronAPI.onUpdateDownloaded(() => {
      setDownloading(false)
      setUpdateReady(true)
    })

    // Error
    window.electronAPI.onUpdateError((error) => {
      console.error('Update error:', error)
      setDownloading(false)
    })

    return () => {
      window.electronAPI.removeAllListeners('update-available')
      window.electronAPI.removeAllListeners('download-progress')
      window.electronAPI.removeAllListeners('update-downloaded')
      window.electronAPI.removeAllListeners('update-error')
    }
  }, [])

  const handleDownload = () => {
    window.electronAPI.downloadUpdate()
  }

  const handleInstall = () => {
    window.electronAPI.installUpdate()
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
    setUpdateReady(false)
  }

  if (!updateAvailable && !updateReady) return null

  return (
    <div className="fixed top-12 right-4 z-50 animate-slide-down">
      <div className="bg-dark-card border border-primary rounded-lg shadow-2xl shadow-primary/20 p-4 min-w-[320px] max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCw size={16} className="text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Mise à jour disponible</h4>
              {updateInfo && (
                <p className="text-xs text-gray-500">Version {updateInfo.version}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress (when downloading) */}
        {downloading && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Téléchargement...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!downloading && !updateReady && (
            <button onClick={handleDownload} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Download size={16} />
              Télécharger
            </button>
          )}

          {updateReady && (
            <button onClick={handleInstall} className="btn-primary flex-1 flex items-center justify-center gap-2 animate-pulse">
              <RefreshCw size={16} />
              Redémarrer et installer
            </button>
          )}

          {!updateReady && (
            <button onClick={handleDismiss} className="btn-secondary px-4">
              Plus tard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
