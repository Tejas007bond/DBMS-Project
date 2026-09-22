import { Plus } from 'lucide-react'

export default function AddButton({ label = 'Add', onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  )
}
