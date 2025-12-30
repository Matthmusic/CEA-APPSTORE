import ceaLogo from '../img/CEA-APPSTOREBLANC.svg'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  showLogo?: boolean
}

export default function EmptyState({ title, description, icon, showLogo = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {showLogo && (
        <img
          src={ceaLogo}
          alt="CEA AppStore"
          className="w-24 h-24 mb-6 opacity-50"
        />
      )}
      {icon && (
        <div className="mb-4 text-gray-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">{description}</p>
    </div>
  )
}
