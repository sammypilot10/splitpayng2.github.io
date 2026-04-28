'use client'

import { useState } from 'react'

const SERVICES = [
  { name: 'Netflix Premium 4K', price: 7200 },    // Current NGN price
  { name: 'Spotify Family Plan', price: 4600 },
  { name: 'ChatGPT Plus', price: 18000 }           // $20 at current rate
]

export function SavingsCalculator() {
  const [serviceIdx, setServiceIdx] = useState(0)
  const [seats, setSeats] = useState(4)

  const service = SERVICES[serviceIdx]
  const platformFeePercentage = 0.20 // 20%
  // Host sets price = original / seats. Member pays that. Host gets price * 0.8.
  // To member, cost is just (original / seats).
  const memberCost = Math.ceil(service.price / seats)
  const savings = service.price - memberCost

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold text-fintech-navy mb-6">Calculate Your Savings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Select Service</label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-fintech-gold outline-none text-fintech-navy font-medium"
            value={serviceIdx}
            onChange={(e) => setServiceIdx(Number(e.target.value))}
          >
            {SERVICES.map((s, idx) => (
              <option key={s.name} value={idx}>{s.name} (₦{s.price.toLocaleString()}/mo)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Total People Sharing</label>
          <input 
            type="range" 
            min="2" 
            max="6" 
            value={seats} 
            onChange={(e) => setSeats(Number(e.target.value))}
            className="w-full accent-fintech-gold"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2</span><span>6</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">You Pay:</span>
            <span className="text-2xl font-bold text-fintech-navy">₦{memberCost.toLocaleString()} <span className="text-sm font-normal text-gray-400">/mo</span></span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">You Save:</span>
            <span className="text-xl font-bold text-green-500">₦{savings.toLocaleString()} <span className="text-sm font-normal">/mo</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}