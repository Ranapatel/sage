'use client'

import React, { useEffect, useState } from 'react'
import { SignIn, SignUp, useAuth } from '@clerk/nextjs'
import { useAuthGuardStore } from '@/store/authGuardStore'
import { X } from 'lucide-react'

export default function AuthGuardModal() {
  const { isOpen, onSuccess, closeAuthModal } = useAuthGuardStore()
  const { isSignedIn } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    // When the user logs in, execute onSuccess and close the modal
    if (isSignedIn && isOpen) {
      if (onSuccess) {
        onSuccess()
      }
      closeAuthModal()
    }
  }, [isSignedIn, isOpen, onSuccess, closeAuthModal])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col items-center">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-white mb-1">Authentication Required</h2>
          <p className="text-slate-400 text-xs">Please sign up or log in to continue with this action.</p>
        </div>

        <div className="w-full flex justify-center py-2 max-h-[70vh] overflow-y-auto">
          {mode === 'signin' ? (
            <SignIn
              routing="virtual"
              signUpUrl="#"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                  card: 'bg-transparent border-0 shadow-none text-white',
                  header: 'hidden', // Hide default Clerk headers
                  footerActionLink: 'text-blue-500 hover:text-blue-400',
                  socialButtonsBlockButton: 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800',
                  socialButtonsBlockButtonText: 'text-white',
                  formFieldLabel: 'text-slate-300',
                  formFieldInput: 'bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500',
                  footer: 'text-slate-400',
                  footerAction: 'text-slate-400'
                }
              }}
            />
          ) : (
            <SignUp
              routing="virtual"
              signInUrl="#"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                  card: 'bg-transparent border-0 shadow-none text-white',
                  header: 'hidden',
                  footerActionLink: 'text-blue-500 hover:text-blue-400',
                  socialButtonsBlockButton: 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800',
                  socialButtonsBlockButtonText: 'text-white',
                  formFieldLabel: 'text-slate-300',
                  formFieldInput: 'bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500',
                }
              }}
            />
          )}
        </div>

        <div className="mt-4 text-xs text-slate-400">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-blue-500 hover:underline">
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-blue-500 hover:underline">
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
