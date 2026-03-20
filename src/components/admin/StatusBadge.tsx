// src/components/admin/StatusBadge.tsx
export function AdminStatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
      case 'admin':
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
      case 'host':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'failed':
      case 'disputed':
      case 'suspended':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStyles()}`}>
      {status.toUpperCase()}
    </span>
  )
}