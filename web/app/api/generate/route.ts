import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' }, { status: 503 })
  }

  // verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const body = await req.json()
  const { prompt, secao } = body as { prompt: string; secao?: string }

  if (!prompt) return NextResponse.json({ error: 'Prompt obrigatório.' }, { status: 400 })

  const systemPrompt = secao
    ? `Você é um especialista em criação de artes esportivas de futsal. Sua tarefa é melhorar e enriquecer especificamente a seção "${secao}" do prompt de geração de arte recebido. Mantenha o estilo e estrutura. Retorne apenas o texto da seção melhorada, sem explicações adicionais.`
    : `Você é um especialista em criação de artes esportivas de futsal. Analise o prompt de geração de arte recebido e adicione detalhes cinematográficos, técnicos e criativos para torná-lo mais poderoso. Mantenha o formato e estrutura. Retorne apenas o prompt melhorado, sem explicações adicionais.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Erro na API Claude: ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const text = data.content?.[0]?.text ?? ''
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Erro ao chamar a API Claude.' }, { status: 500 })
  }
}
