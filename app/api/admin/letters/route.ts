import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all letters with user information
    const { data: letters, error: lettersError } = await supabase
      .from('letters')
      .select(`
        *,
        user:users(name, email)
      `)
      .order('created_at', { ascending: false })

    if (lettersError) {
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 })
    }

    return NextResponse.json({ letters: letters || [] })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}