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

// In Phase 1 foundation, we provide a mock logged-in user so the rest of the application
// compiles and runs without the old login flow. This will be replaced with Clerk later.
const MOCK_USER: AuthUser = {
  id: 'demo-user-id',
  name: 'Demo Traveler',
  email: 'demo@tripsage.ai',
  currency: 'INR',
  country: 'India',
  preferences: {},
  trips: [],
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: MOCK_USER,
      token: 'mock-jwt-token',
      isLoggedIn: true,
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
            ...MOCK_USER,
            email,
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
        if (!get().user) {
          set({ user: MOCK_USER, isLoggedIn: true })
        }
      },
    }),
    {
      name: 'tripsage-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isLoggedIn: s.isLoggedIn }),
    }
  )
)
