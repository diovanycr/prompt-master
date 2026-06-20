import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // rotas públicas
  if (pathname.startsWith('/login')) {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // rota admin
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    if (role?.role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // protege todas as outras rotas
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // verifica se o usuário está aprovado
  const { data: status } = await supabase
    .from('user_status')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (!status || status.status === 'pending') {
    return NextResponse.redirect(new URL('/aguardando', request.url))
  }
  if (status.status === 'rejected') {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?erro=acesso_negado', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|aguardando).*)'],
}
