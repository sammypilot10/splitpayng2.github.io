// src/app/admin/system/page.tsx
import { Settings, ShieldCheck, Database } from 'lucide-react'

export default function AdminSystemPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0F1E]">System Settings</h1>
        <p className="text-sm text-gray-500">Manage global platform configurations.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-3xl">
        <div className="space-y-8">
          
          <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
            <div className="bg-fintech-gold/10 p-3 rounded-xl text-fintech-gold"><Settings size={20} /></div>
            <div className="flex-1">
              <h3 className="font-bold text-fintech-navy">Platform Fee Rate</h3>
              <p className="text-sm text-gray-500 mb-3">The percentage deducted from host payouts.</p>
              <input type="text" disabled value="20%" className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-bold text-gray-500" />
            </div>
          </div>

          <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-500"><ShieldCheck size={20} /></div>
            <div className="flex-1">
              <h3 className="font-bold text-fintech-navy">Escrow Duration</h3>
              <p className="text-sm text-gray-500 mb-3">Time before auto-confirmation.</p>
              <input type="text" disabled value="48 Hours" className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-bold text-gray-500" />
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-500"><Database size={20} /></div>
            <div className="flex-1">
              <h3 className="font-bold text-fintech-navy">Database Maintenance</h3>
              <p className="text-sm text-gray-500 mb-3">Clear orphaned sessions and temporary tables.</p>
              <button disabled className="bg-gray-100 text-gray-400 font-bold px-4 py-2 rounded-lg cursor-not-allowed">Run Cleanup (Disabled)</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}