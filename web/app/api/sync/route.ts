import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient as createServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser() {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ data: null })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await request.json()

  const { error } = await supabaseAdmin
    .from('user_data')
    .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
