// src/components/admin/DataTable.tsx
import { Loader2 } from 'lucide-react'

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
}

export function DataTable({ columns, data, loading }: DataTableProps) {
  if (loading) {
    return (
      <div className="w-full h-64 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
        No records found.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}