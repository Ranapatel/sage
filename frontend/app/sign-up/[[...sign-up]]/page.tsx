import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'bg-slate-950 border border-slate-800 text-white shadow-xl',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-slate-400',
              socialButtonsBlockButton: 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800',
              socialButtonsBlockButtonText: 'text-white',
              formFieldLabel: 'text-slate-300',
              formFieldInput: 'bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500',
              footerActionText: 'text-slate-400',
              footerActionLink: 'text-blue-500 hover:text-blue-400',
            }
          }}
        />
      </div>
    </div>
  )
}
