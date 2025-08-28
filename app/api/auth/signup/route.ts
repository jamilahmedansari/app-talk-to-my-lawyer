import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { email, password, name, role = 'user' } = await request.json()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        }
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
    }

    // Create user record in our custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user record:', userError)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    // If contractor, create contractor record
    if (role === 'contractor') {
      const username = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5)
      
      const { error: contractorError } = await supabase
        .from('contractors')
        .insert({
          user_id: authData.user.id,
          username,
          points: 0,
          total_signups: 0,
        })

      if (contractorError) {
        console.error('Error creating contractor record:', contractorError)
      }
    }

    // If admin, create admin record  
    if (role === 'admin') {
      const { error: adminError } = await supabase
        .from('admins')
        .insert({
          user_id: authData.user.id,
          permissions: ['read', 'write'],
        })

      if (adminError) {
        console.error('Error creating admin record:', adminError)
      }
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: userData,
      session: authData.session 
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}