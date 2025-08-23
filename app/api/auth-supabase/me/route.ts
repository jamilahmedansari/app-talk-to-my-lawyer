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

    // Get user profile from our custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        contractor:contractors(*),
        admin:admins(*)
      `)
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ 
        error: 'User profile not found',
        user: { id: user.id, email: user.email }
      }, { status: 404 })
    }

    return NextResponse.json({ 
      user: userData,
      auth_user: user 
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}