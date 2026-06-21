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
      } else if ((e.key === 'c' || e.key === 'C') && !inText) {
        const { fullPrompt } = usePromptStore.getState()
        if (fullPrompt) { e.preventDefault(); navigator.clipboard.writeText(fullPrompt) }
      } else if ((e.key === 's' || e.key === 'S') && !inText) {
        e.preventDefault()
        const s = usePromptStore.getState()
        if (!s.form.adv) return
        s.addPartida({
          id: crypto.randomUUID(),
          ts: Date.now(),
          adv: s.form.adv,
          data: s.form.data,
          hora: s.form.hora,
          local: s.form.local,
          campeonato: s.form.campeonato,
          golsNos: s.form.golsNos,
          golsAdv: s.form.golsAdv,
          modo: s.modo,
        })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}
