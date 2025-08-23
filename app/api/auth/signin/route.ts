import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    // Sign in with Supabase Auth
    const { email, password } = await request.json()

    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: userData.role
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    )

    return NextResponse.json({ 
      message: 'Sign in successful',
      user: userData,
      token
    })

  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}