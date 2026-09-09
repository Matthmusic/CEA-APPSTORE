import * as semver from 'semver'
import type { GitHubRelease } from '../types'

export type ReleaseChannel = 'stable' | 'beta' | 'dev'

export function versionChannel(version: string): ReleaseChannel | null {
  const clean = semver.valid(version.trim().replace(/^v/, ''))
  if (!clean) return null
  const pre = semver.prerelease(clean)
  if (!pre) return 'stable'
  if (pre[0] === 'beta' || pre[0] === 'rc') return 'beta'
  if (pre[0] === 'dev' || pre[0] === 'alpha' || pre[0] === 'nightly') return 'dev'
  return null
}

export function installerAsset(release: GitHubRelease) {
  return release.assets
    .filter(asset => /\.exe$/i.test(asset.name) && !/portable|arm64|ia32/i.test(asset.name))
    .sort((a, b) => Number(/setup|installer/i.test(b.name)) - Number(/setup|installer/i.test(a.name)))[0]
}

export function selectRelease(releases: GitHubRelease[], channel: ReleaseChannel) {
  return releases.filter(release =>
    !release.draft && versionChannel(release.tag_name) === channel &&
    (channel !== 'stable' || !release.prerelease) && installerAsset(release)
  ).sort((a, b) => semver.rcompare(a.tag_name.replace(/^v/, ''), b.tag_name.replace(/^v/, '')))[0] ?? null
}

// Experimental installations are deliberately excluded from all update prompts.
export function shouldProposeUpdate(current: string, latest: string) {
  return versionChannel(current) === 'stable' && versionChannel(latest) === 'stable' &&
    semver.gt(latest.trim().replace(/^v/, ''), current.trim().replace(/^v/, ''))
}

// A beta superseded by a stable release is no longer advertised.
export function availableBetaVersion(beta: string | undefined, stable: string | undefined): string | undefined {
  if (!beta || versionChannel(beta) !== 'beta') return undefined
  if (!stable || !semver.valid(stable.replace(/^v/, ''))) return beta
  return semver.gt(beta.replace(/^v/, ''), stable.replace(/^v/, '')) ? beta : undefined
}
