'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { ToastProvider } from '@/components/ui/Toast'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setStatus, setRole, setLoading } = useAuthStore()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        setLoading(false)
        return
      }

      setUser(user)

      const [{ data: st, error: stErr }, { data: rl }] = await Promise.all([
        supabase.from('user_status').select('status').eq('user_id', user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
      ])

      const status = st?.status ?? null
      setStatus(status)
      setRole(rl?.role ?? null)
      setLoading(false)

      if (!status || status === 'pending') {
        router.replace('/aguardando')
      } else if (status === 'rejected') {
        await supabase.auth.signOut()
        router.replace('/login?erro=acesso_negado')
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setUser(null); setStatus(null); setRole(null); setLoading(false)
        router.replace('/login')
        return
      }
      setUser(session.user)
      const [{ data: st }, { data: rl }] = await Promise.all([
        supabase.from('user_status').select('status').eq('user_id', session.user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', session.user.id).single(),
      ])
      const status = st?.status ?? null
      setStatus(status)
      setRole(rl?.role ?? null)
      setLoading(false)

      if (!status || status === 'pending') {
        router.replace('/aguardando')
      } else if (status === 'rejected') {
        await supabase.auth.signOut()
        router.replace('/login?erro=acesso_negado')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <ToastProvider>{children}</ToastProvider>
}
