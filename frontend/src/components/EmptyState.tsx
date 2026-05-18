import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; to?: string; onClick?: () => void }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-zinc-500" />}
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-400 mb-4 max-w-sm">{description}</p>}
      {action && (
        action.to ? (
          <Link to={action.to} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
