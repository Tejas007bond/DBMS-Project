import { Trash2 } from 'lucide-react'

export default function DeleteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  )
}
