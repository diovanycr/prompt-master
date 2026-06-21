import AuthProvider from '@/components/layout/AuthProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Header from '@/components/layout/Header'
import AppShell from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'

export default function Home() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="flex flex-col h-screen">
            <Header />
            <AppShell />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
