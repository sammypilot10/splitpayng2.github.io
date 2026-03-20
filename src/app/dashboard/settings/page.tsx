// src/app/dashboard/settings/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { Building2, CreditCard, ShieldCheck, Loader2, AlertCircle, ChevronDown, Search, CheckCircle2 } from 'lucide-react'

export default function PayoutSettingsPage() {
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  
  const [accountName, setAccountName] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  const [banks, setBanks] = useState<any[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  // 1. Fetch the live list of banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('/api/payouts/banks')
        const data = await res.json()
        if (data.status) {
          const sortedBanks = data.data.sort((a: any, b: any) => a.name.localeCompare(b.name))
          setBanks(sortedBanks)
        }
      } catch (err) {
        console.error("Failed to load banks")
      } finally {
        setIsLoadingBanks(false)
      }
    }
    fetchBanks()
  }, [])

  // 2. Automatically verify when 10 digits are typed
  useEffect(() => {
    const verifyAccount = async () => {
      if (accountNumber.length === 10 && bankCode) {
        setIsVerifying(true)
        setError('')
        setAccountName('')
        setIsSuccess(false) // Reset success state if they change details
        
        try {
          const res = await fetch(`/api/payouts/verify-bank?account_number=${accountNumber}&bank_code=${bankCode}`)
          const data = await res.json()
          
          if (res.ok) {
            setAccountName(data.account_name)
          } else {
            setError(data.error || 'Could not verify account details.')
          }
        } catch (err) {
          setError('Network error. Please try again.')
        } finally {
          setIsVerifying(false)
        }
      } else {
        setAccountName('')
        setError('')
        setIsSuccess(false)
      }
    }

    verifyAccount()
  }, [accountNumber, bankCode])

  // Function to save details to Supabase using 'as any'
  const handleSaveBankDetails = async () => {
    setIsSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to save bank details.")

      const selectedBank = banks.find(b => b.code === bankCode)

      const { error: dbError } = await (supabase.from('profiles') as any)
        .update({
          bank_code: bankCode,
          bank_name: selectedBank?.name || '',
          account_number: accountNumber,
          account_name: accountName
        })
        .eq('id', user.id)

      if (dbError) throw dbError

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to save bank details. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-fintech-slate">
      <AppNavbar userRole="host" />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-fintech-navy tracking-tight">Payout Settings</h1>
          <p className="text-gray-500 mt-2">Link your Nigerian bank account to withdraw your SplitPayNG earnings.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-fintech-navy">Bank Account Details</h2>
              <p className="text-sm text-gray-500">Your funds will be sent directly to this account.</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Searchable Bank Dropdown */}
            <div className="relative">
              <label className="block text-sm font-bold text-fintech-navy mb-2">Search & Select Bank</label>
              
              <div 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-fintech-navy flex items-center justify-between cursor-pointer transition-all"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={bankCode ? "text-fintech-navy font-medium" : "text-gray-400"}>
                  {isLoadingBanks 
                    ? "Loading banks..." 
                    : bankCode 
                      ? banks.find(b => b.code === bankCode)?.name 
                      : "-- Search for your bank --"
                  }
                </span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50 sticky top-0">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Type to search e.g. Moniepoint" 
                        className="w-full pl-9 p-3 bg-white border border-gray-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-fintech-gold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto p-2">
                    {isLoadingBanks ? (
                      <div className="p-4 text-center text-sm text-gray-500 flex justify-center"><Loader2 className="animate-spin" size={16}/></div>
                    ) : filteredBanks.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No banks found.</div>
                    ) : (
                      filteredBanks.map(bank => (
                        <div 
                          key={bank.code}
                          className="p-3 hover:bg-fintech-navy hover:text-white rounded-lg cursor-pointer text-sm font-medium transition-colors"
                          onClick={() => {
                            setBankCode(bank.code);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                        >
                          {bank.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-fintech-navy mb-2">Account Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <CreditCard size={18} />
                </div>
                <input 
                  type="text" 
                  maxLength={10}
                  className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fintech-navy outline-none transition-all font-medium"
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} 
                />
                
                {isVerifying && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Loader2 className="animate-spin text-fintech-gold" size={18} />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {accountName && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <ShieldCheck className="text-green-600" size={20} />
                <div>
                  <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider mb-1">Verified Account Name</p>
                  <p className="font-bold text-fintech-navy">{accountName}</p>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="p-4 bg-fintech-navy text-white rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-fintech-gold" size={20} />
                <p className="text-sm font-medium">Bank details saved successfully! You are ready for payouts.</p>
              </div>
            )}

            <Button 
              onClick={handleSaveBankDetails}
              disabled={!accountName || isSaving || isSuccess} 
              className="w-full bg-fintech-navy hover:bg-fintech-navy/90 text-white py-6 mt-4 disabled:opacity-50 transition-all flex justify-center items-center font-bold"
            >
              {isSaving ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Saving securely...</>
              ) : isSuccess ? (
                "Saved"
              ) : accountName ? (
                "Save Bank Details"
              ) : (
                "Enter details to continue"
              )}
            </Button>

            {/* 🔥 NEW: Back to Dashboard Button that shows up after success */}
            {isSuccess && (
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full py-6 mt-2 border-fintech-navy text-fintech-navy hover:bg-gray-50 font-bold"
              >
                ← Back to Host Dashboard
              </Button>
            )}
            
          </div>
        </div>
      </main>
    </div>
  )
}