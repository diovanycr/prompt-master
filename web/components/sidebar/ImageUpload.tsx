'use client'

import { useEffect, useRef, useState } from 'react'
import { usePromptStore } from '@/store/promptStore'

const IMG_KEYS: Record<string, string> = {
  atleta: 'pm_img_atleta',
  logo1: 'pm_img_logo1',
  logo2: 'pm_img_logo2',
}

async function comprimirImagem(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ImageUpload({
  inputKey,
  label,
  obrigatorio = false,
}: {
  inputKey: 'atleta' | 'logo1' | 'logo2'
  label: string
  obrigatorio?: boolean
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setHasFoto, setHasLogo1, setHasLogo2 } = usePromptStore()

  const setHas = inputKey === 'atleta' ? setHasFoto : inputKey === 'logo1' ? setHasLogo1 : setHasLogo2

  useEffect(() => {
    const b64 = localStorage.getItem(IMG_KEYS[inputKey])
    if (b64) { setPreview(b64); setHas(true) }
  }, [inputKey])

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setHas(true)
    try {
      const maxPx = inputKey === 'atleta' ? 900 : 500
      const b64 = await comprimirImagem(file, maxPx)
      localStorage.setItem(IMG_KEYS[inputKey], b64)
      setPreview(b64)
    } catch {
      // preview remains as object URL for the session
    }
  }

  function remover() {
    localStorage.removeItem(IMG_KEYS[inputKey])
    setPreview(null)
    setHas(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="relative">
      <label className="block text-[10px] font-medium text-[#888898] mb-1">{label}</label>
      <div
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
          preview
            ? 'border-[#f0b429]/40 bg-[#1e1e2e]'
            : obrigatorio
              ? 'border-[#f0b429]/30 hover:border-[#f0b429]/60 bg-[#1e1e2e] h-24'
              : 'border-[#2a2a3e] hover:border-[#3a3a5e] bg-[#1e1e2e] h-20'
        }`}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-24 object-contain p-1" />
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-1">{inputKey === 'atleta' ? '👤' : '🛡️'}</div>
            <p className="text-[10px] text-[#888898]">{obrigatorio ? 'Clique para enviar (obrigatório)' : 'Clique para enviar (opcional)'}</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={() => inputRef.current?.click()}
            className="flex-1 py-1 text-[10px] bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg text-[#888898] hover:text-[#e8e8f0] transition-colors"
          >
            🔄 Trocar
          </button>
          <button
            onClick={remover}
            className="flex-1 py-1 text-[10px] bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg text-red-400 hover:bg-red-950/50 transition-colors"
          >
            🗑️ Remover
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
