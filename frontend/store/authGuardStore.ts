import { create } from 'zustand'

interface AuthGuardState {
  isOpen: boolean
  onSuccess: (() => void) | null
  openAuthModal: (onSuccess: () => void) => void
  closeAuthModal: () => void
}

export const useAuthGuardStore = create<AuthGuardState>((set) => ({
  isOpen: false,
  onSuccess: null,
  openAuthModal: (onSuccess) => set({ isOpen: true, onSuccess }),
  closeAuthModal: () => set({ isOpen: false, onSuccess: null }),
}))
