'use client'

import { useEffect } from 'react'
import { usePromptStore } from '@/store/promptStore'

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return
      const inText = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (document.activeElement as HTMLElement)?.tagName ?? ''
      )
      if (e.key === 'Enter') {
        e.preventDefault()
        usePromptStore.getState().gerar(e.shiftKey)
      } else if (e.key === 'z' && !e.shiftKey && !inText) {
        e.preventDefault()
        usePromptStore.getState().desfazer()
      } else if ((e.key === 'l' || e.key === 'L') && !inText) {
        e.preventDefault()
        const { idioma, setIdioma } = usePromptStore.getState()
        setIdioma(idioma === 'pt' ? 'en' : 'pt')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}
