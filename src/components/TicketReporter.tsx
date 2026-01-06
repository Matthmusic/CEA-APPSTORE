import React, { useState, useEffect, useMemo } from 'react';
import { Octokit } from '@octokit/rest';
import { useAppStore } from '../context/AppStoreContext';

interface TicketReporterProps {
  appName: string;
  appVersion: string;
  githubToken: string;
  githubOwner?: string;
  githubRepo?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  username?: string;
}

export const TicketReporter: React.FC<TicketReporterProps> = ({
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
  const [success, setSuccess] = useState(false);
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

  // Mettre à jour la version quand appVersion change
  useEffect(() => {
    if (appVersion && formData.selectedApp === appName) {
      setFormData(prev => ({
        ...prev,
        selectedVersion: appVersion,
      }));
    }
  }, [appVersion, appName]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const octokit = new Octokit({ auth: githubToken });

      const timestamp = new Date().toISOString();

      const issueTitle = `[${formData.selectedApp} v${formData.selectedVersion}] ${formData.title}`;
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

      await octokit.rest.issues.create({
        owner: githubOwner,
        repo: githubRepo,
        title: issueTitle,
        body: issueBody,
        labels,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setFormData({
          selectedApp: appName,
          selectedVersion: appVersion,
          type: 'bug',
          priority: 'medium',
          title: '',
          description: '',
          logs: '',
        });
      }, 2000);
    } catch (err) {
      setError('Impossible de créer le ticket. Vérifiez votre connexion.');
      console.error(err);
    } finally {
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
          <div className="bg-dark-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Signaler un problème
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
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
                    Nous avons bien reçu votre signalement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                          selectedVersion: selectedAppData?.currentVersion || selectedAppData?.latestVersion || 'N/A',
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
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2 border border-dark-border rounded-lg hover:bg-dark-bg transition-colors text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
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
