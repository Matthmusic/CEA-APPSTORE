import { useEffect } from 'react'
import { Filter, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useAppStore } from '../context/AppStoreContext'
import AppCard from '../components/AppCard'
import EmptyState from '../components/EmptyState'
import ceaLogo from '../img/CEA-APPSTOREBLANC.svg'

interface CatalogPageProps {
  onRefreshAttentionChange?: (needsAttention: boolean) => void
}

export default function CatalogPage({ onRefreshAttentionChange }: CatalogPageProps) {
  const {
    apps,
    filteredApps,
    loading,
    error,
    filter,
    searchQuery,
    refreshCatalog,
    downloadAndInstallApp,
    launchInstalledApp,
  } = useAppStore()

  useEffect(() => {
    if (!onRefreshAttentionChange) return

    const shouldBlink =
      !loading &&
      (Boolean(error) || (apps.length === 0 && filter === 'all' && searchQuery.trim() === ''))

    onRefreshAttentionChange(shouldBlink)
  }, [apps.length, error, filter, loading, onRefreshAttentionChange, searchQuery])

  const handleRefresh = () => {
    refreshCatalog()
  }

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-dark-border">
        <div className="flex flex-col items-center mb-4">
          <img
            src={ceaLogo}
            alt="CEA AppStore"
            className="w-64 h-32 opacity-90 mb-3"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Catalogue d'applications
            </h1>
            <p className="text-sm text-gray-500">
              Installez et mettez à jour vos applications CEA
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <img src={ceaLogo} alt="CEA AppStore" className="w-16 h-16 mb-4 opacity-20 animate-pulse" />
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <p className="text-gray-500">Chargement du catalogue...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle size={24} className="text-red-500" />
                <h3 className="text-lg font-semibold text-red-500">Erreur</h3>
              </div>
              <p className="text-sm text-gray-400">{error}</p>
              <button onClick={handleRefresh} className="btn-primary mt-4 w-full">
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Apps Grid */}
        {!loading && !error && (
          <>
            {filteredApps.length === 0 ? (
              <EmptyState
                title="Catalogue vide"
                description="Aucune application disponible pour le moment"
                icon={<Filter size={48} />}
                showLogo={true}
              />
            ) : (
              <>
                <div className="mb-6 flex items-center justify-center gap-4">
                  <div className="text-sm text-gray-400 font-medium">
                    {filteredApps.length} application{filteredApps.length > 1 ? 's' : ''} disponible{filteredApps.length > 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Actualiser
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-6 mx-auto">
                  {filteredApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onInstall={downloadAndInstallApp}
                      onLaunch={launchInstalledApp}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
