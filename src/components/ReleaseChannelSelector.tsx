import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import * as semver from 'semver'
import type { AppWithStatus, GitHubRelease } from '../types'
import { fetchChannelRelease } from '../services/githubService'
import { installerAsset, type ReleaseChannel } from '../services/releasePolicy'

export default function ReleaseChannelSelector({ app, onInstall }: {
  app: AppWithStatus
  onInstall: (app: AppWithStatus) => void
}) {
  const id = useId()
  const menu = useRef<HTMLDetailsElement>(null)
  const request = useRef(0)
  const [channel, setChannel] = useState<ReleaseChannel | ''>('')
  const [release, setRelease] = useState<GitHubRelease | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => () => { request.current += 1 }, [])

  async function handleChannel(next: ReleaseChannel | '') {
    const token = ++request.current
    setChannel(next)
    setRelease(null)
    setError('')
    setAcknowledged(false)
    setLoading(!!next)
    if (!next) return
    try {
      const result = await fetchChannelRelease(app.repo, next, app.owner)
      if (request.current === token) setRelease(result)
    } catch {
      if (request.current === token) setError('Versions indisponibles. Réessayez dans un instant.')
    } finally {
      if (request.current === token) setLoading(false)
    }
  }

  const current = semver.valid(app.currentVersion?.replace(/^v/, '') ?? '')
  const target = semver.valid(release?.tag_name.replace(/^v/, '') ?? '')
  const sameVersion = !!current && !!target && semver.eq(current, target)
  const downgrade = !!current && !!target && semver.lt(target, current)
  const needsAcknowledgement = app.installed && (!!downgrade || channel === 'dev' || channel === 'beta')

  return (
    <details className="group/channels mt-3 border-t border-dark-border pt-3" onDragStart={event => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 py-2 text-xs text-gray-400 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        Options avancées
        <ChevronDown size={14} aria-hidden="true" className="shrink-0 group-open/channels:rotate-180" />
      </summary>
      <div className="pt-3">
      <p id={id} className="mb-2 text-xs text-gray-400">Canal de version</p>
      <details ref={menu} className="group/picker rounded-xl border border-dark-border bg-dark-bg"
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) event.currentTarget.open = false }}
        onKeyDown={event => {
          if (event.key === 'Escape' && menu.current?.open) {
            event.stopPropagation()
            menu.current.open = false
            menu.current.querySelector('summary')?.focus()
          }
        }}>
        <summary aria-labelledby={id + ' ' + id + '-value'}
          className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs text-gray-200 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
          <span id={id + '-value'}>{channel === 'stable' ? 'Stable' : channel === 'beta' ? 'Bêta' : channel === 'dev' ? 'Développement' : 'Choisir un canal'}</span>
          <ChevronDown size={14} aria-hidden="true" className="text-primary group-open/picker:rotate-180" />
        </summary>
        <fieldset disabled={app.isDownloading} className="space-y-1 border-t border-dark-border p-1.5">
          <legend className="sr-only">Canal de version</legend>
          {([
            { value: 'stable', label: 'Stable', description: 'Version courante' },
            { value: 'beta', label: 'Bêta', description: 'Version de test · sur demande' },
            { value: 'dev', label: 'Développement', description: 'Version de travail · sur demande' },
          ] as const).map(option => (
            <button key={option.value} type="button" aria-pressed={channel === option.value}
              onClick={() => {
                void handleChannel(option.value)
                if (menu.current) { menu.current.open = false; menu.current.querySelector('summary')?.focus() }
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 ${channel === option.value ? 'bg-primary/10 text-primary' : 'text-gray-200'}`}>
              <span><span className="block font-medium">{option.label}</span><span className="mt-0.5 block text-[11px] text-gray-400">{option.description}</span></span>
              {channel === option.value && <Check size={14} aria-hidden="true" className="shrink-0 text-primary" />}
            </button>
          ))}
        </fieldset>
      </details>
      {app.currentVersion && <p className="mt-1 text-xs text-gray-400">Installée : {app.currentVersion}</p>}
      <div aria-live="polite" className="mt-2 text-xs text-gray-300">
        {loading && 'Recherche des versions…'}
        {error && <p role="alert">{error} <button className="underline" onClick={() => void handleChannel(channel)}>Réessayer</button></p>}
        {channel && !loading && !error && !release && 'Aucune version disponible dans ce canal.'}
        {release && <p>{release.tag_name}{sameVersion ? ' — déjà installée' : ''}</p>}
      </div>
      {release && !sameVersion && (
        <>
          {needsAcknowledgement && (
            <label className="mt-2 flex items-start gap-2 text-xs text-gray-300">
              <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} className="mt-0.5 accent-orange-500" />
              J’ai sauvegardé mes données. Cette installation remplace la version actuelle{downgrade ? ' par une version plus ancienne, potentiellement incompatible avec les données récentes' : ''}.
            </label>
          )}
          <button disabled={app.isDownloading || (needsAcknowledgement && !acknowledged)}
            className="mt-2 w-full rounded-lg border border-primary/50 px-3 py-2 text-xs text-white hover:bg-primary/10 disabled:opacity-40"
            onClick={() => {
              const asset = installerAsset(release)
              if (asset) onInstall({ ...app, latestVersion: release.tag_name, downloadUrl: asset.browser_download_url })
            }}>
            {app.isDownloading ? 'Installation en cours…' : downgrade ? 'Revenir à cette version' : 'Installer cette version'}
          </button>
        </>
      )}
      </div>
    </details>
  )
}
