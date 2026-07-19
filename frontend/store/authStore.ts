import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  _id?: string
  id?: string
  name: string
  email: string
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED'
  country: string
  preferences: Record<string, any>
  trips: string[]
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null

  signup: (data: { name: string; email: string; password: string; currency: string; country: string }) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateCurrency: (currency: AuthUser['currency']) => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  clearError: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      loading: false,
      error: null,

      signup: async (data) => {
        set({ loading: true })
        set({
          user: {
            id: 'demo-user-id',
            name: data.name,
            email: data.email,
            currency: (data.currency as any) || 'INR',
            country: data.country,
            preferences: {},
            trips: [],
          },
          isLoggedIn: true,
          loading: false,
        })
      },

      login: async (email, password) => {
        set({ loading: true })
        set({
          user: {
            id: 'legacy-user',
            name: email.split('@')[0],
            email,
            currency: 'INR',
            country: 'India',
            preferences: {},
            trips: [],
          },
          isLoggedIn: true,
          loading: false,
        })
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false, error: null })
      },

      updateCurrency: async (currency) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, currency } })
        }
      },

      updateProfile: async (data) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },

      clearError: () => set({ error: null }),

      restoreSession: async () => {
        // No-op: Clerk manages the primary session. Legacy store sessions persist via zustand/persist.
      },
    }),
    {
      name: 'tripsage-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isLoggedIn: s.isLoggedIn }),
    }
  )
)
