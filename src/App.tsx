import { useEffect, useState, type CSSProperties } from 'react'
import { Minus, Square, X, Settings, RefreshCw } from 'lucide-react'
import { AppStoreProvider } from './context/AppStoreContext'
import CatalogPage from './pages/CatalogPage'
import UpdateNotification from './components/UpdateNotification'
import TicketReporter from './components/TicketReporter'
import SettingsModal from './components/SettingsModal'
import logoIcon from './img/ICO-CEA-APPTSTORE.svg'

function App() {
  const [appVersion, setAppVersion] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [refreshAttention, setRefreshAttention] = useState(false)

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setAppVersion)
    // Charger les paramètres sauvegardés
    setGithubToken(localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || '')
    setGithubUsername(localStorage.getItem('github_username') || '')
  }, [])

  const handleSaveSettings = (token: string, username: string) => {
    setGithubToken(token)
    setGithubUsername(username)
    // Recharger la page pour appliquer le nouveau token
    window.location.reload()
  }

  const handleWindowMinimize = () => {
    window.electronAPI.windowMinimize()
  }

  const handleWindowMaximize = () => {
    window.electronAPI.windowMaximize()
  }

  const handleWindowClose = () => {
    window.electronAPI.windowClose()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const dragRegionStyle = { WebkitAppRegion: 'drag' } as CSSProperties
  const noDragRegionStyle = { WebkitAppRegion: 'no-drag' } as CSSProperties

  return (
    <AppStoreProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Custom Title Bar */}
        <div
          className="h-8 bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/30 grid grid-cols-[auto_1fr_auto] items-center px-2"
          style={dragRegionStyle}
        >
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="CEA AppStore" className="w-4 h-4" />
            <span className="text-xs font-semibold text-primary tracking-wider">
              CEA APPSTORE
            </span>
          </div>
          <div className="justify-self-center text-[10px] text-gray-500 font-medium">
            {appVersion && `v${appVersion}`}
          </div>
          <div className="h-8 flex items-center" style={noDragRegionStyle}>
            <button
              onClick={handleRefresh}
              className={`w-10 h-8 flex items-center justify-center hover:bg-white/5 transition-colors${refreshAttention ? ' refresh-attention' : ''}`}
              title="Rafraîchir"
            >
              <RefreshCw
                size={12}
                className={refreshAttention ? 'text-primary' : 'text-gray-400'}
                strokeWidth={2.5}
              />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-8 flex items-center justify-center hover:bg-white/5 transition-colors"
              title="Paramètres"
            >
              <Settings size={12} className="text-gray-400" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleWindowMinimize}
              className="w-12 h-8 flex items-center justify-center hover:bg-white/5 transition-colors"
              title="Reduire"
            >
              <Minus size={12} className="text-gray-400" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleWindowMaximize}
              className="w-12 h-8 flex items-center justify-center hover:bg-white/5 transition-colors"
              title="Agrandir"
            >
              <Square size={10} className="text-gray-400" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleWindowClose}
              className="w-12 h-8 flex items-center justify-center hover:bg-red-500/90 hover:text-white transition-colors"
              title="Fermer"
            >
              <X size={12} className="text-gray-400 hover:text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <CatalogPage onRefreshAttentionChange={setRefreshAttention} />
        </div>

        {/* Update Notification */}
        <UpdateNotification />

        {/* Ticket Reporter - Bouton Signaler un problème */}
        <TicketReporter
          appName="CEA-APPSTORE"
          appVersion={appVersion}
          githubToken={githubToken}
          githubOwner="Matthmusic"
          githubRepo="CEA-APPSTORE-TICKETS"
          position="bottom-right"
          username={githubUsername}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveSettings}
        />
      </div>
    </AppStoreProvider>
  )
}

export default App
