import React from 'react';

interface MonetaryInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (val: number) => void;
}

export function MonetaryInput({ value, onChange, ...props }: MonetaryInputProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="text-gray-500 font-bold">₦</span>
      </div>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-gray-50 border border-gray-200 text-fintech-navy text-lg font-bold rounded-xl focus:ring-2 focus:ring-fintech-gold/30 focus:border-fintech-gold block w-full pl-10 p-4 transition-all outline-none"
        {...props}
      />
    </div>
  )
}