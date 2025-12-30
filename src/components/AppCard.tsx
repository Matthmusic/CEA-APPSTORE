import { Download, Check, RefreshCw, ExternalLink, Rocket } from 'lucide-react'
import type { AppWithStatus } from '../types'
import { getAppColor, getAppLogo } from '../utils/appLogos'
import { useState } from 'react'

interface AppCardProps {
  app: AppWithStatus
  onInstall: (app: AppWithStatus) => void
  onLaunch: (app: AppWithStatus) => void
}

export default function AppCard({ app, onInstall, onLaunch }: AppCardProps) {
  const [logoError, setLogoError] = useState(false)
  const appColor = getAppColor(app.id)
  // Utilise le logo du cea-app.json si disponible, sinon fallback sur le logo local
  const appLogo = app.icon || getAppLogo(app.id)

  const handleInstall = () => {
    if (!app.isDownloading) {
      onInstall(app)
    }
  }

  const handleOpenRepo = () => {
    window.electronAPI.openExternal(app.repoUrl)
  }

  const handleLaunch = () => {
    onLaunch(app)
  }

  return (
    <div className="group relative w-full">
      {/* Glassmorphism Card */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 hover:border-primary rounded-2xl p-5 shadow-2xl transition-all duration-500 overflow-hidden">

        {/* Gradient Background Effect */}
        <div
          className="absolute inset-[1px] opacity-0 transition-opacity duration-500 rounded-[15px] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${appColor.from} 0%, ${appColor.to} 100%)`
          }}
        />

        {/* Status Badges */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {app.installed && (
            <div className="backdrop-blur-md bg-green-500/20 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
              <Check size={12} className="inline" />
            </div>
          )}
          {app.canUpdate && (
            <div className="backdrop-blur-md bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
              <RefreshCw size={12} className="inline" />
            </div>
          )}
        </div>

        {/* Logo Section */}
        <div className="relative flex flex-col items-center mb-4">
          <div
            className="w-32 h-32 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden transition-transform duration-500"
            style={{
              background: logoError || !appLogo
                ? `linear-gradient(135deg, ${appColor.from} 0%, ${appColor.to} 100%)`
                : 'rgba(255, 255, 255, 0.03)',
            }}
          >
            {appLogo && !logoError ? (
              <img
                src={appLogo}
                alt={app.name}
                className="w-full h-full object-contain p-4"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="text-5xl font-bold text-white/40">
                {app.name.charAt(0)}
              </div>
            )}
          </div>

          {/* App Info */}
          <h3 className="text-base font-bold text-white mb-1 text-center transition-colors duration-300">
            {app.name}
          </h3>
          <p className="text-xs text-gray-400 mb-2">{app.category}</p>
          {app.shortDescription && (
            <p className="text-xs text-gray-500 text-center leading-relaxed line-clamp-2">
              {app.shortDescription}
            </p>
          )}
        </div>

        {/* Version */}
        <div className="flex items-center justify-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-gray-400">Version</span>
          <span className="text-sm font-mono font-bold text-primary">
            {app.latestVersion || 'N/A'}
          </span>
        </div>

        {/* Download Progress */}
        {app.isDownloading && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <div className="flex items-center gap-2">
                <span>Téléchargement...</span>
                {app.downloadSpeed && (
                  <span className="text-primary font-medium">
                    {(app.downloadSpeed / (1024 * 1024)).toFixed(1)} MB/s
                  </span>
                )}
              </div>
              <span className="font-mono">{Math.round(app.downloadProgress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary via-primary-light to-primary rounded-full transition-all duration-300"
                style={{ width: `${app.downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary Action with GitHub */}
          {!app.installed && app.downloadUrl && (
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={app.isDownloading}
                className="flex-[3] bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-black text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download size={16} />
                {app.isDownloading ? 'Téléchargement...' : 'Installer'}
              </button>
              <button
                onClick={handleOpenRepo}
                className="flex-1 bg-dark-card/60 hover:bg-dark-border/70 border border-dark-border text-gray-300 hover:text-white py-2 px-2 rounded-xl transition-colors duration-300 flex items-center justify-center"
                title="Voir sur GitHub"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          )}

          {app.installed && app.canUpdate && app.downloadUrl && (
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={app.isDownloading}
                className="flex-[3] bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-black text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <RefreshCw size={16} />
                {app.isDownloading ? 'Téléchargement...' : 'Mettre à jour'}
              </button>
              <button
                onClick={handleOpenRepo}
                className="flex-1 bg-dark-card/60 hover:bg-dark-border/70 border border-dark-border text-gray-300 hover:text-white py-2 px-2 rounded-xl transition-colors duration-300 flex items-center justify-center"
                title="Voir sur GitHub"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          )}

          {app.installed && !app.canUpdate && (
            <div className="flex gap-2">
              <button
                onClick={handleLaunch}
                className="launch-button flex-[3]"
                title="Lancer l'application"
              >
                <span className="launch-cube">
                  <span className="launch-face launch-front">
                    <Check size={16} />
                    À jour
                  </span>
                  <span className="launch-face launch-back">
                    <Rocket size={16} />
                    Lancer
                  </span>
                </span>
              </button>
              <button
                onClick={handleOpenRepo}
                className="flex-1 bg-dark-card/60 hover:bg-dark-border/70 border border-dark-border text-gray-300 hover:text-white py-2 px-2 rounded-xl transition-colors duration-300 flex items-center justify-center"
                title="Voir sur GitHub"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          )}

          {!app.downloadUrl && !app.installed && (
            <div className="flex gap-2">
              <div className="flex-[3] backdrop-blur-md bg-white/5 border border-white/10 text-gray-500 py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center">
                Aucune version disponible
              </div>
              <button
                onClick={handleOpenRepo}
                className="flex-1 bg-dark-card/60 hover:bg-dark-border/70 border border-dark-border text-gray-300 hover:text-white py-2 px-2 rounded-xl transition-colors duration-300 flex items-center justify-center"
                title="Voir sur GitHub"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
