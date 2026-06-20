import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// usa service role key para bypassar RLS na criação do usuário
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId e email são obrigatórios' }, { status: 400 })
    }

    const [r1, r2] = await Promise.all([
      supabaseAdmin.from('user_status').upsert({
        user_id: userId,
        email,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      supabaseAdmin.from('user_roles').upsert({
        user_id: userId,
        role: 'user',
      }),
    ])

    if (r1.error) return NextResponse.json({ error: r1.error.message }, { status: 500 })
    if (r2.error) return NextResponse.json({ error: r2.error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
