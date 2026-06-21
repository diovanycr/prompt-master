import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prompt Master Futsal',
  description: 'Gerador de prompts para artes de marketing do futsal',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#f0b429',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('pm-theme');var L={'--gold':'#c8860a','--gold-dark':'#a06808','--bg':'#f0f2f7','--surface':'#ffffff','--surface2':'#e8eaf2','--border':'#d0d3e0','--text':'#1a1a2e','--text-muted':'#60607a','--input-bg':'#f5f6fc','--scrollbar':'#c8cad8'};var D={'--gold':'#f0b429','--gold-dark':'#c8860a','--bg':'#0a0a0f','--surface':'#14141e','--surface2':'#1e1e2e','--border':'#2a2a3e','--text':'#e8e8f0','--text-muted':'#888898','--input-bg':'#1e1e2e','--scrollbar':'#2a2a3e'};var v=t==='light'?L:D;var r=document.documentElement;for(var k in v)r.style.setProperty(k,v[k]);r.setAttribute('data-theme',t||'dark');})()` }} />
      </head>
      <body suppressHydrationWarning className={`${inter.className} min-h-full`} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  )
}
