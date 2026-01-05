import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (token: string, username: string) => void
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Charger les paramètres existants
      const savedToken = localStorage.getItem('github_token') || ''
      const savedUsername = localStorage.getItem('github_username') || ''
      setToken(savedToken)
      setUsername(savedUsername)
    }
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem('github_token', token)
    localStorage.setItem('github_username', username)
    onSave(token, username)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-dark-card border border-primary rounded-xl shadow-2xl shadow-primary/20 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilisé pour identifier vos tickets sur TicketX
            </p>
          </div>

          {/* GitHub Token */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token GitHub
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
            />
          </div>

          {/* Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              <strong className="text-primary">Comment obtenir un token ?</strong>
              <br />
              Pour obtenir un token, veuillez demander à l'administrateur de l'app.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-dark-border">
          <button onClick={onClose} className="btn-secondary flex-1">
            Annuler
          </button>
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save size={16} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
