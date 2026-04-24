import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import API from '@/lib/api'

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
        set({ loading: true, error: null })
        try {
          const res: any = await API.post('/api/auth/signup', data)
          const { token, user } = res.data
          // Attach token to all future requests
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ token, user, isLoggedIn: true, loading: false })
        } catch (err: any) {
          set({ error: err.message, loading: false })
          throw err
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const res: any = await API.post('/api/auth/login', { email, password })
          const { token, user } = res.data
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ token, user, isLoggedIn: true, loading: false })
        } catch (err: any) {
          set({ error: err.message, loading: false })
          throw err
        }
      },

      logout: () => {
        delete API.defaults.headers.common['Authorization']
        set({ user: null, token: null, isLoggedIn: false, error: null })
      },

      updateCurrency: async (currency) => {
        const { token, user } = get()
        if (!user) return
        try {
          const res: any = await API.patch('/api/auth/profile', { currency })
          set({ user: { ...user, currency } })
        } catch {
          // Update locally even if server fails
          set({ user: { ...user, currency } })
        }
      },

      updateProfile: async (data) => {
        set({ loading: true, error: null })
        try {
          const res: any = await API.patch('/api/auth/profile', data)
          const updated = res.data?.user ?? { ...get().user, ...data }
          set({ user: updated, loading: false })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      clearError: () => set({ error: null }),

      restoreSession: async () => {
        const { token } = get()
        if (!token) return
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`
        try {
          const res: any = await API.get('/api/auth/me')
          set({ user: res.data?.user, isLoggedIn: true })
        } catch {
          // Token expired or invalid — logout
          get().logout()
        }
      },
    }),
    {
      name: 'tripsage-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isLoggedIn: s.isLoggedIn }),
    }
  )
)
