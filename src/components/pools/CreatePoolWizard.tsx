// src/components/pools/CreatePoolWizard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { MonetaryInput } from '@/components/ui/MonetaryInput'
import { encryptData } from '@/lib/crypto'
import { Shield, Lock, CheckCircle2, Copy, AlertTriangle } from 'lucide-react'
import { getMaxShareableSeats, getServiceLimitLabel, validateSeatCount } from '@/lib/serviceConfig'

type PoolInsert = Database['public']['Tables']['pools']['Insert']
type CredentialsInsert = Database['public']['Tables']['pool_credentials']['Insert']
type PoolRow = Database['public']['Tables']['pools']['Row']

const PRESET_SERVICES = [
  { name: 'Netflix Premium', category: 'Video' },
  { name: 'Amazon Prime Video', category: 'Video' },
  { name: 'Showmax Pro', category: 'Video' },
  { name: 'DSTV Stream', category: 'Video' },
  { name: 'YouTube Premium', category: 'Video' },
  { name: 'Crunchyroll', category: 'Video' },
  { name: 'Spotify Family', category: 'Music' },
  { name: 'Apple Music Family', category: 'Music' },
  { name: 'Audiomack Premium', category: 'Music' },
  { name: 'ChatGPT Plus', category: 'AI Tools' },
  { name: 'Claude Pro', category: 'AI Tools' },
  { name: 'Gemini Advanced', category: 'AI Tools' },
  { name: 'Perplexity Pro', category: 'AI Tools' },
  { name: 'Midjourney', category: 'AI Tools' },
  { name: 'GitHub Copilot', category: 'AI Tools' },
  { name: 'Canva Pro', category: 'Software' },
  { name: 'Microsoft 365 Family', category: 'Software' },
  { name: 'Adobe Creative Cloud', category: 'Software' },
  { name: 'PlayStation Plus', category: 'Gaming' },
  { name: 'Xbox Game Pass Ultimate', category: 'Gaming' },
  { name: 'Nintendo Switch Online', category: 'Gaming' },
  { name: 'Other (Custom)', category: 'Custom' }
]

// ACCEPT THE PROP HERE
export function CreatePoolWizard({ hostId }: { hostId: string }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [selectedPreset, setSelectedPreset] = useState(PRESET_SERVICES[0].name)
  const [serviceName, setServiceName] = useState(PRESET_SERVICES[0].name)
  const [category, setCategory] = useState(PRESET_SERVICES[0].category)
  const [price, setPrice] = useState(2500)
  const [isPublic, setIsPublic] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  // ── Seat Limit Logic ──────────────────────────────────────────────
  const currentMaxAllowed = getMaxShareableSeats(
    selectedPreset === 'Other (Custom)' ? serviceName : selectedPreset
  )
  const currentLimitLabel = getServiceLimitLabel(
    selectedPreset === 'Other (Custom)' ? serviceName : selectedPreset
  )
  const [maxSeats, setMaxSeats] = useState(Math.min(4, currentMaxAllowed))

  // Auto-clamp seats when the service (and therefore the limit) changes
  useEffect(() => {
    setMaxSeats((prev) => Math.min(prev, currentMaxAllowed) || 1)
  }, [currentMaxAllowed])

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value
    setSelectedPreset(selected)
    
    if (selected !== 'Other (Custom)') {
      setServiceName(selected)
      const matchedService = PRESET_SERVICES.find(s => s.name === selected)
      if (matchedService) setCategory(matchedService.category)
    } else {
      setServiceName('')
      setCategory('Software')
    }
  }

  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    // Clamp between 1 and the service's max shareable seats
    setMaxSeats(Math.max(1, Math.min(value, currentMaxAllowed)))
  }

  const handleCreate = async () => {
    if (!serviceName.trim()) return alert("Please enter a service name.")
    if (!hostId) return alert("System error: Missing Host ID. Try refreshing the page.")
    
    // ── Strict seat validation before DB call ──
    const seatError = validateSeatCount(serviceName.trim(), maxSeats)
    if (seatError) return alert(seatError)

    setLoading(true)
    try {
      // Fetch host profile to attach metadata to the pool
      const { data: hostProfile } = await (supabase.from('profiles') as any).select('username, whatsapp_number').eq('id', hostId).single()

      const poolData: PoolInsert = {
        host_id: hostId, 
        host_username: hostProfile?.username || null,
        host_whatsapp: hostProfile?.whatsapp_number || null,
        service_name: serviceName.trim(),
        category,
        price_per_seat: price,
        max_seats: maxSeats,
        current_seats: 0,
        is_public: isPublic,
        status: 'active',
      }

      // Generate invite token for private pools
      const invite_token = !isPublic
        ? Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('')
        : null

      const { data, error: poolError } = await supabase
        .from('pools')
        .insert({ ...poolData, invite_token } as any)
        .select()
        .single()

      if (poolError) throw poolError

      const pool = data as PoolRow
      if (!pool || !pool.id) throw new Error("Failed to return created pool")

      const payload = JSON.stringify({ username, password })
      const { encryptedData, iv } = await encryptData(payload)

      const credData: CredentialsInsert = {
        pool_id: pool.id,
        encrypted_data: encryptedData,
        iv: iv
      }

      const { error: credError } = await supabase
        .from('pool_credentials')
        .insert(credData as any)

      if (credError) throw credError

      if (!isPublic && invite_token) {
        setInviteLink(`${window.location.origin}/pools/join?token=${invite_token}`)
        setStep(4)
      } else {
        router.push('/dashboard?success=true')
      }
    } catch (error: any) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-fintech-gold' : 'bg-gray-100'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold text-fintech-navy">Pool Details</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Service Name</label>
            <select value={selectedPreset} onChange={handleServiceChange} className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-fintech-gold outline-none text-fintech-navy font-medium">
              {PRESET_SERVICES.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>

            {selectedPreset === 'Other (Custom)' && (
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                <div>
                  <label className="block text-sm font-medium mb-2 text-fintech-navy/70">Custom Service Name</label>
                  <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g. MasterClass" className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:border-fintech-gold outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-fintech-navy/70">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:border-fintech-gold outline-none">
                    <option>Video</option><option>Music</option><option>AI Tools</option><option>Software</option><option>Gaming</option><option>Other</option>
                  </select>
                </div>
              </div>
            )}
            {selectedPreset !== 'Other (Custom)' && <p className="text-xs text-gray-400 mt-2">Category: <span className="font-semibold text-fintech-gold">{category}</span></p>}
          </div>

          {/* ── Seat Count with Dynamic Limits ── */}
          <div>
            <label className="block text-sm font-medium mb-2">Total Seats Available to Share</label>
            <input
              type="number"
              value={maxSeats}
              onChange={handleSeatChange}
              className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-fintech-gold outline-none"
              min={1}
              max={currentMaxAllowed}
            />
            {/* Dynamic limit hint */}
            <div className="mt-2 flex items-start gap-2 text-xs">
              <AlertTriangle size={14} className="text-fintech-gold shrink-0 mt-0.5" />
              <p className="text-gray-500">
                <span className="font-bold text-fintech-navy">{selectedPreset === 'Other (Custom)' ? serviceName || 'Custom service' : selectedPreset}</span>
                {' '}— {currentLimitLabel}. Max you can list: <span className="font-bold text-fintech-gold">{currentMaxAllowed}</span>
              </p>
            </div>
          </div>
          <Button onClick={() => setStep(2)} className="w-full py-4 text-lg mt-4" disabled={!serviceName.trim()}>Next Step</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold text-fintech-navy">Pricing & Visibility</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Price Per Seat (Monthly)</label>
            <MonetaryInput value={price} onChange={setPrice} />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Shield size={12}/> SplitPayNG deducts a 20% platform fee from your payouts.</p>
          </div>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-fintech-gold" />
            <div>
              <p className="font-bold text-fintech-navy text-sm">List on Public Marketplace</p>
              <p className="text-xs text-gray-500">Uncheck to make this pool private (invite-only link).</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 py-4">Back</Button>
            <Button onClick={() => setStep(3)} className="w-2/3 py-4">Next Step</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-fintech-navy">Secure Credentials</h2>
            <div className="group relative cursor-pointer">
              <Lock className="text-green-500" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex gap-3 text-green-800 text-sm">
            <CheckCircle2 className="shrink-0" />
            <p>Your password will be locked in an encrypted vault. Members only gain access after their payment is secured in escrow.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Login Email / Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-fintech-gold outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-fintech-gold outline-none" />
          </div>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 py-4" disabled={loading}>Back</Button>
            <Button onClick={handleCreate} isLoading={loading} className="w-2/3 py-4 bg-fintech-navy hover:bg-fintech-navy/90 text-white shadow-xl shadow-fintech-navy/20">
              Encrypt & Create Pool
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-fintech-navy">Pool Created Successfully!</h2>
          <p className="text-gray-500">Your private pool is ready. Share this invite link with people you want to join.</p>
          
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4 mt-6">
            <code className="text-sm font-bold text-fintech-navy truncate flex-1 text-left">{inviteLink}</code>
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(inviteLink)
                alert('Copied to clipboard!')
              }}
              className="shrink-0 flex items-center gap-2 text-sm"
            >
              <Copy size={16} /> Copy
            </Button>
          </div>

          <Button onClick={() => router.push('/dashboard')} className="w-full py-4 mt-8 bg-fintech-navy text-white">
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}