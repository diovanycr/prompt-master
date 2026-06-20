import AuthProvider from '@/components/layout/AuthProvider'
import Header from '@/components/layout/Header'
import AppShell from '@/components/layout/AppShell'

export default function Home() {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <AppShell />
      </div>
    </AuthProvider>
  )
}
