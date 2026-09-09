import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { AppWithStatus } from '../types';
import { Octokit } from '@octokit/rest';
import { useAppStore } from '../context/AppStoreContext';

interface TicketReporterProps {
  requestedApp?: AppWithStatus | null;
  onRequestHandled?: () => void;
  onOpenSettings?: () => void;
  appName: string;
  appVersion: string;
  githubToken: string;
  githubOwner?: string;
  githubRepo?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  username?: string;
}

export const TicketReporter: React.FC<TicketReporterProps> = ({
  requestedApp, onRequestHandled, onOpenSettings,
  appName,
  appVersion,
  githubToken,
  githubOwner = 'Matthmusic',
  githubRepo = 'CEA-APPSTORE-TICKETS',
  position = 'bottom-right',
  username = 'Utilisateur anonyme',
}) => {
  const { apps } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const submitting = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const sortedApps = useMemo(
    () => [...apps].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })),
    [apps]
  );

  const [formData, setFormData] = useState({
    selectedApp: appName,
    selectedVersion: appVersion,
    type: 'bug' as 'bug' | 'feature' | 'question',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    title: '',
    description: '',
    logs: '',
  });

  useEffect(() => {
    setFormData(prev => prev.selectedApp === appName ? { ...prev, selectedVersion: appVersion } : prev);
  }, [appVersion, appName]);

  useEffect(() => {
    if (!requestedApp) return;
    setFormData(prev => ({ ...prev, selectedApp: requestedApp.name, selectedVersion: requestedApp.currentVersion || requestedApp.latestVersion || 'N/A' }));
    setSuccess(null);
    setError(null);
    setIsOpen(true);
    onRequestHandled?.();
  }, [requestedApp, onRequestHandled]);

  const close = () => { if (!submitting.current) { setIsOpen(false); setSuccess(null); } };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!githubToken.trim()) { setError('Configurez votre token GitHub dans les paramètres pour envoyer un ticket.'); return; }
    if (!formData.title.trim() || !formData.description.trim()) { setError('Renseignez un titre et une description.'); return; }
    submitting.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const octokit = new Octokit({ auth: githubToken });

      const timestamp = new Date().toISOString();

      const issueTitle = `[${formData.selectedApp} v${formData.selectedVersion.trim().replace(/^v/, '') || 'N/A'}] ${formData.title}`;
      const issueBody = `## Description

${formData.description}

---

## Informations Système

- **Créé par:** ${username || 'Utilisateur anonyme'}
- **Application:** ${formData.selectedApp}
- **Version:** ${formData.selectedVersion}
- **Date:** ${new Date(timestamp).toLocaleString('fr-FR')}

${formData.logs ? `## Logs

\`\`\`
${formData.logs}
\`\`\`

` : ''}---

*Ce ticket a été créé automatiquement depuis l'application*`;

      const labels = [
        `app:${formData.selectedApp}`,
        `type:${formData.type}`,
        `priority:${formData.priority}`,
        'status:open',
      ];

      const { data: issue } = await octokit.rest.issues.create({
        owner: githubOwner,
        repo: githubRepo,
        title: issueTitle,
        body: issueBody,
        labels,
      });

      setSuccess(issue.html_url);
      setFormData(prev => ({ ...prev, title: '', description: '', logs: '' }));
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(status === 401 ? 'Token GitHub invalide ou expiré. Mettez-le à jour dans les paramètres.'
        : status === 403 ? 'GitHub refuse cet envoi : vérifiez les droits Issues en écriture et la limite de requêtes.'
        : status === 404 ? 'Dépôt de tickets inaccessible. Vérifiez les droits du token sur CEA-APPSTORE-TICKETS.'
        : status === 422 ? 'GitHub refuse les données du ticket. Vérifiez les champs et les labels du dépôt.'
        : 'Envoi non confirmé. Vérifiez les tickets avant de réessayer pour éviter un doublon. Votre saisie est conservée.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses[position]} z-50 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all hover:scale-105 font-medium`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span>Signaler un problème</span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Signaler un problème" className="bg-dark-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Signaler un problème
                </h2>
                <button
                  aria-label="Fermer"
                  onClick={close} disabled={isSubmitting}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ticket créé avec succès !
                  </h3>
                  <p className="text-gray-400">
                    Le ticket est disponible dans TicketX.
                    <button type="button" className="block mx-auto mt-4 text-primary underline" onClick={() => window.electronAPI.openExternal(success)}>Ouvrir le ticket</button>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!githubToken.trim() && <p className="text-amber-300 text-sm">Un token GitHub est nécessaire pour envoyer un ticket.</p>}
                  <div className="flex gap-4 text-sm text-primary">
                    <button type="button" onClick={() => { close(); onOpenSettings?.(); }}>Paramètres GitHub</button>
                    <button type="button" onClick={() => window.electronAPI.openExternal('https://github.com/' + githubOwner + '/' + githubRepo + '/issues')}>Consulter les tickets</button>
                  </div>
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Application concernée *
                    </label>
                    <select
                      value={formData.selectedApp}
                      onChange={(e) => {
                        const selectedAppData = apps.find(app => app.name === e.target.value);
                        setFormData({
                          ...formData,
                          selectedApp: e.target.value,
                          selectedVersion: e.target.value === appName ? appVersion : selectedAppData?.currentVersion || selectedAppData?.latestVersion || 'N/A',
                        });
                      }}
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="CEA-APPSTORE">CEA-APPSTORE (cette application)</option>
                      {sortedApps.map((app) => (
                        <option key={app.name} value={app.name}>
                          {app.name} {app.installed ? '(installée)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="block text-white">Version concernée
                    <input aria-label="Version concernée" value={formData.selectedVersion} maxLength={80} onChange={e => setFormData({ ...formData, selectedVersion: e.target.value })} className="mt-2 w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg" />
                    <span className="text-xs text-gray-400">Vérifiez la version installée, y compris le suffixe bêta ou dev.</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                      >
                        <option value="bug">Bug</option>
                        <option value="feature">Fonctionnalité</option>
                        <option value="question">Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Priorité
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                        <option value="critical">Critique</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                      placeholder="Résumé du problème"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                      placeholder="Décrivez le problème en détail..."
                      rows={5}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Logs (optionnel)
                    </label>
                    <textarea
                      value={formData.logs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          logs: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary resize-none font-mono text-sm"
                      placeholder="Collez ici les messages d'erreur ou logs..."
                      rows={4}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Si vous avez des messages d'erreur, collez-les ici
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={close} disabled={isSubmitting}
                      className="px-6 py-2 border border-dark-border rounded-lg hover:bg-dark-bg transition-colors text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !githubToken.trim()}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketReporter;
