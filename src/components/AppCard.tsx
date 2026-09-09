import { useEffect, useId, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Download, Check, RefreshCw, ExternalLink, Rocket, GripVertical, MoreHorizontal, MessageSquarePlus, Tickets } from 'lucide-react'
import type { AppWithStatus } from '../types'
import { getAppColor, getAppLogo } from '../utils/appLogos'
import ReleaseChannelSelector from './ReleaseChannelSelector'

interface AppCardProps {
  app: AppWithStatus
  onInstall: (app: AppWithStatus) => void
  onLaunch: (app: AppWithStatus) => void
  onReportTicket?: (app: AppWithStatus) => void
  draggable?: boolean
  isDragging?: boolean
  isDragOver?: boolean
  onDragStart?: () => void
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void
  onDragEnd?: () => void
  onDrop?: () => void
}

export default function AppCard({
  app, onInstall, onLaunch, onReportTicket,
  draggable: isDraggable, isDragging, isDragOver,
  onDragStart, onDragOver, onDragEnd, onDrop,
}: AppCardProps) {
  const [supportOpen, setSupportOpen] = useState(false)
  const supportRef = useRef<HTMLDivElement>(null)
  const supportButton = useRef<HTMLButtonElement>(null)
  const supportId = useId()

  useEffect(() => {
    if (!supportOpen) return
    supportRef.current?.querySelector<HTMLButtonElement>('[data-support-action]')?.focus()
    const dismiss = (event: PointerEvent) => {
      if (!supportRef.current?.contains(event.target as Node)) setSupportOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSupportOpen(false)
        supportButton.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [supportOpen])

  const appColor = getAppColor(app.id)
  const localLogo = getAppLogo(app.id)
  const [logoSrc, setLogoSrc] = useState<string | undefined>(app.icon || localLogo)
  const [logoError, setLogoError] = useState(false)

  const handleLogoError = () => {
    if (localLogo && logoSrc !== localLogo) {
      setLogoSrc(localLogo)
    } else {
      setLogoError(true)
    }
  }

  const handleInstall = () => { if (!app.isDownloading) onInstall(app) }
  const handleOpenRepo = () => { window.electronAPI.openExternal(app.repoUrl) }
  const handleLaunch = () => { onLaunch(app) }


  return (
    <div
      className={`group relative w-full transition-all duration-200
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-30 scale-95' : ''}
      `}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <div className={`relative bg-dark-card border rounded-2xl overflow-hidden shadow-xl transition-all duration-300
        ${isDragOver
          ? 'border-primary shadow-primary/30 shadow-lg scale-[1.02]'
          : 'border-dark-border hover:border-primary/50 hover:shadow-primary/10 hover:shadow-lg'
        }`}
      >

        {/* ── LOGO BANNER ─────────────────────────────── */}
        <div
          className="relative h-44 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${appColor.from}28 0%, ${appColor.to}18 100%)`,
          }}
        >
          {/* Ambient glow behind logo */}
          <div
            className="absolute w-40 h-40 rounded-full blur-3xl opacity-35 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${appColor.from} 0%, transparent 70%)` }}
          />

          {/* Logo container */}
          <div
            className="relative z-10 w-[120px] h-[120px] rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl"
            style={{
              background: logoError || !logoSrc
                ? `linear-gradient(135deg, ${appColor.from} 0%, ${appColor.to} 100%)`
                : 'rgba(255,255,255,0.05)',
            }}
          >
            {logoSrc && !logoError ? (
              <img
                src={logoSrc}
                alt={app.name}
                className="w-full h-full object-contain p-2.5"
                onError={handleLogoError}
              />
            ) : (
              <span className="text-3xl font-bold text-white/50">{app.name.charAt(0)}</span>
            )}
          </div>

          <div ref={supportRef} className="absolute top-2 right-2 z-30"
            onPointerDown={event => event.stopPropagation()}
            onDragStart={event => event.stopPropagation()}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setSupportOpen(false) }}>
            <button ref={supportButton} type="button" aria-label={`Assistance pour ${app.name}`} title="Assistance"
              aria-expanded={supportOpen} aria-controls={supportId}
              onClick={() => setSupportOpen(open => !open)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <MoreHorizontal size={18} aria-hidden="true" />
            </button>
            {supportOpen && (
              <div id={supportId} className="absolute right-0 top-10 w-52 rounded-xl border border-dark-border bg-dark-card p-1 shadow-lg">
                <button data-support-action type="button" disabled={!onReportTicket}
                  onClick={() => { setSupportOpen(false); onReportTicket?.(app) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-gray-200 hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:outline-none disabled:opacity-40">
                  <MessageSquarePlus size={14} aria-hidden="true" /> Signaler un problème
                </button>
                <button data-support-action type="button"
                  onClick={() => { setSupportOpen(false); supportButton.current?.focus(); void window.electronAPI.openExternal('https://github.com/Matthmusic/CEA-APPSTORE-TICKETS/issues?q=' + encodeURIComponent('is:issue label:"app:' + app.name + '"')) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-gray-200 hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:outline-none">
                  <Tickets size={14} aria-hidden="true" /> Voir les tickets
                </button>
              </div>
            )}
          </div>

          {/* Status badges – top-right */}
          <div className="absolute top-4 right-12 z-20 flex gap-1.5">
            {app.installed && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-1 rounded-full shadow-md">
                <Check size={10} />
              </div>
            )}
            {app.canUpdate && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-1 rounded-full shadow-md animate-pulse">
                <RefreshCw size={10} />
              </div>
            )}
          </div>

          {/* Drag handle – top-left */}
          {isDraggable && (
            <div className="absolute top-2.5 left-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical size={13} className="text-white/35" />
            </div>
          )}

          {/* Bottom fade into card body */}
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-dark-card to-transparent pointer-events-none" />
        </div>

        {/* ── INFO SECTION ────────────────────────────── */}
        <div className="px-4 pt-3 pb-4">

          {/* Name + Version */}
          <h3 className="text-sm font-bold text-white leading-tight truncate text-center mb-0.5">
            {app.name}
          </h3>
          <p className="text-[11px] font-mono font-semibold text-primary/70 text-center mb-2">
            {app.latestVersion || 'N/A'}
          </p>

          {app.betaVersion && (
            <p className="mb-3 text-center text-[11px] text-violet-300" title="Version de test accessible dans le sélecteur de canal, sur demande uniquement.">
              Bêta disponible · {app.betaVersion}
            </p>
          )}

          {/* Description (1 line) or Download progress */}
          {app.isDownloading ? (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                <span>Téléchargement…</span>
                <div className="flex items-center gap-1.5">
                  {app.downloadSpeed && (
                    <span className="text-primary font-medium">
                      {(app.downloadSpeed / (1024 * 1024)).toFixed(1)} MB/s
                    </span>
                  )}
                  <span className="font-mono">{Math.round(app.downloadProgress)}%</span>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ background: `linear-gradient(90deg, ${appColor.from}, ${appColor.to})`, width: `${app.downloadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 line-clamp-1 mb-3 min-h-[14px]">
              {app.shortDescription ?? ''}
            </p>
          )}

          {/* ── ACTIONS ──────────────────────────────── */}
          {!app.installed && app.downloadUrl && (
            <div className="flex gap-1.5">
              <button
                onClick={handleInstall}
                disabled={app.isDownloading}
                className="btn-action-primary"
              >
                <Download size={12} />
                {app.isDownloading ? 'Téléchargement…' : 'Installer'}
              </button>
              <button
                onClick={handleOpenRepo}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white py-2 px-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center"
                title="Voir sur GitHub"
                aria-label="Voir sur GitHub"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          )}

          {app.installed && app.canUpdate && app.downloadUrl && (
            <div className="flex gap-1.5">
              <button
                onClick={handleInstall}
                disabled={app.isDownloading}
                className="btn-action-update"
              >
                <RefreshCw size={12} />
                {app.isDownloading ? 'Téléchargement…' : 'Mettre à jour'}
              </button>
              <button
                onClick={handleOpenRepo}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white py-2 px-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center"
                title="Voir sur GitHub"
                aria-label="Voir sur GitHub"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          )}

          {app.installed && !app.canUpdate && (
            <div className="flex gap-1.5">
              <button
                onClick={handleLaunch}
                className="btn-action-primary"
              >
                <Rocket size={12} />
                Lancer
              </button>
              <button
                onClick={handleOpenRepo}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white py-2 px-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center"
                title="Voir sur GitHub"
                aria-label="Voir sur GitHub"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          )}

          {!app.downloadUrl && !app.installed && (
            <div className="flex gap-1.5">
              <div className="flex-1 bg-white/5 border border-white/10 text-gray-600 py-2 px-3 rounded-xl text-[11px] text-center flex items-center justify-center">
                Aucune version disponible
              </div>
              <button
                onClick={handleOpenRepo}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white py-2 px-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center"
                title="Voir sur GitHub"
                aria-label="Voir sur GitHub"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          )}

          <ReleaseChannelSelector app={app} onInstall={onInstall} />

        </div>
      </div>
    </div>
  )
}
