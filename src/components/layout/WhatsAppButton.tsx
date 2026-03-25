// src/components/layout/WhatsAppButton.tsx
'use client'

import { MessageCircle } from 'lucide-react'

export function WhatsAppButton() {
  // Put your real WhatsApp number here (Use 234 but no + sign)
  const adminWhatsAppNumber = "2348117060606" 
  
  const defaultMessage = "Hello SplitPayNG Support, I need help with my subscription pool."
  const whatsappLink = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(defaultMessage)}`

  return (
    <a 
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <MessageCircle size={24} />
      <span className="font-bold text-sm hidden sm:block">Chat with Support</span>
    </a>
  )
}