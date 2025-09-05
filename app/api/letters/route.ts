import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get user's letters
    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 })
    }

    return NextResponse.json({ letters })

  } catch (error) {
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const body = await request.json()
    const { title, content, letter_type = 'general', form_data = {} } = body

    // Create new letter
    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        title,
        content,
        letter_type,
        form_data,
        status: 'draft',
        stage: 1,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Letter created successfully',
      letter
    })

  } catch (error) {
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}