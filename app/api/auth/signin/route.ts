import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Get user profile from our custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        contractor:contractors(*),
        admin:admins(*)
      `)
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      // Silently handle error for production
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)

    return NextResponse.json({ 
      message: 'Sign in successful',
      user: userData || { id: authData.user.id, email: authData.user.email },
      session: authData.session 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}