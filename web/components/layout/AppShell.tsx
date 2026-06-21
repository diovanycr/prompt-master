'use client'

import { useState } from 'react'
import FormSection from '@/components/sidebar/FormSection'
import PromptOutput from '@/components/output/PromptOutput'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar toggle button (mobile) */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 text-black rounded-full shadow-xl text-lg font-bold flex items-center justify-center"
        style={{ background: 'var(--gold)' }}
      >
        {sidebarOpen ? '←' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`flex-none w-80 xl:w-96 overflow-y-auto border-r transition-all duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:relative fixed inset-y-0 left-0 z-40 top-14 lg:top-0`}
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="p-4">
          <FormSection />
        </div>
      </aside>

      {/* Main output */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <PromptOutput />
      </main>
    </div>
  )
}
