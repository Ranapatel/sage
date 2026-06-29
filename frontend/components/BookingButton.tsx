import React from 'react';
import { Train, Bus, ExternalLink } from 'lucide-react';

interface BookingButtonProps {
  label: string;
  icon: 'train' | 'bus';
  url: string;
  provider: string;
  className?: string;
}

export default function BookingButton({ label, icon, url, provider, className = '' }: BookingButtonProps) {
  const isMMT = provider.toLowerCase() === 'makemytrip';

  // MakeMyTrip branded color palette (blue/indigo to red gradient) vs fallback
  const buttonStyle = isMMT
    ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-red-500 text-white shadow-blue-500/20 hover:shadow-blue-500/30 hover:opacity-95'
    : 'bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 shadow-slate-500/10';

  const IconComponent = icon === 'train' ? Train : Bus;

  return (
    <a
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative overflow-hidden flex items-center justify-center gap-2 font-extrabold text-sm py-3 px-5 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-md border border-white/10 group ${buttonStyle} ${className}`}
    >
      {/* Light glow animation overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      <IconComponent size={16} className="transition-transform group-hover:scale-110 group-hover:rotate-3" />
      <span>{label}</span>
      <ExternalLink size={13} strokeWidth={2.5} className="opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />

      {/* Subtle MMT Branding Indicator */}
      {isMMT && (
        <span className="absolute bottom-0 right-2 text-[7px] tracking-widest font-black uppercase text-white/30 select-none pointer-events-none">
          MMT DeepLink
        </span>
      )}
    </a>
  );
}
