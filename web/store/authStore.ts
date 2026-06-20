import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { UserStatus, UserRole } from '@/types'

interface AuthState {
  user: User | null
  status: UserStatus | null
  role: UserRole | null
  loading: boolean
  setUser: (user: User | null) => void
  setStatus: (status: UserStatus | null) => void
  setRole: (role: UserRole | null) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: null,
  role: null,
  loading: true,
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, status: null, role: null, loading: false }),
}))
