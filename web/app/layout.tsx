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
    <html lang="pt-BR" className="h-full dark">
      <body suppressHydrationWarning className={`${inter.className} min-h-full bg-[#0a0a0f] text-[#e8e8f0]`}>
        {children}
      </body>
    </html>
  )
}
