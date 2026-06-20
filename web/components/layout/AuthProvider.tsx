'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { ToastProvider } from '@/components/ui/Toast'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setStatus, setRole, setLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const [{ data: st }, { data: rl }] = await Promise.all([
          supabase.from('user_status').select('status').eq('user_id', user.id).single(),
          supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
        ])
        setStatus(st?.status ?? null)
        setRole(rl?.role ?? null)
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setStatus(null); setRole(null); setLoading(false); return }
      const [{ data: st }, { data: rl }] = await Promise.all([
        supabase.from('user_status').select('status').eq('user_id', session.user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', session.user.id).single(),
      ])
      setStatus(st?.status ?? null)
      setRole(rl?.role ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <ToastProvider>{children}</ToastProvider>
}
