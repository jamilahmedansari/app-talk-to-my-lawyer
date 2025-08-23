import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get letters for the authenticated user
    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching letters:', error)
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 })
    }

    return NextResponse.json({ letters: letters || [] })

  } catch (error) {
    console.error('Error in GET /api/letters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { title, content, recipient, type, status } = await request.json()

    // Insert the new letter
    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        title,
        content,
        recipient,
        type,
        status: status || 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating letter:', error)
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
      return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 })
    }

    return NextResponse.json({ letter })

  } catch (error) {
    console.error('Error in POST /api/letters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}