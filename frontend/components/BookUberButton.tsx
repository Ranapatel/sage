import React from 'react';

interface BookUberButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function BookUberButton({ onClick, isLoading, disabled }: BookUberButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="relative overflow-hidden w-full flex items-center justify-center gap-3 bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
      id="uber-booking-btn"
    >
      {/* Light glow animation overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white transition-transform group-hover:scale-110" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 18.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5 18.5 8.41 18.5 12 15.59 18.5 12 18.5z" />
          <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      )}

      <span className="font-semibold tracking-wide">{isLoading ? 'Finding Rides...' : 'Ride with Uber'}</span>
    </button>
  );
}
