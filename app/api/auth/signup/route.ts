import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    const { email, password, name, role = 'user' } = await request.json()

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password: hashedPassword
    })

    if (authError || !user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
    }

    // Create user profile in our custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        password: hashedPassword,
        name,
        role,
        subscription_status: 'free',
        subscription_letters_remaining: 2, // Free tier gets 2 letters
        is_active: true
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user profile:', userError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
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
      message: 'User created successfully',
      user: userData,
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}