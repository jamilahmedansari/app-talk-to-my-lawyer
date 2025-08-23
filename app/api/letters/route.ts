import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching letters:', error)
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 })
    }

    return NextResponse.json({ letters })

  } catch (error) {
    console.error('Get letters error:', error)
    
    // Type guard for error handling
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const body = await request.json()
    const {
      title,
      content,
      letterType = 'general',
      formData = {},
      urgencyLevel = 'standard'
    } = body

    // Check if user has letters remaining (for subscription logic)
    if (user.subscription_letters_remaining <= 0 && user.subscription_status === 'free') {
      return NextResponse.json({ 
        error: 'No letters remaining. Please upgrade your subscription.' 
      }, { status: 400 })
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        title,
        content,
        letter_type: letterType,
        form_data: formData,
        urgency_level: urgencyLevel,
        status: 'draft',
        stage: 1,
        professional_generated: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating letter:', error)
      return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Letter created successfully',
      letter 
    }, { status: 201 })

  } catch (error) {
    console.error('Create letter error:', error)
    
    // Type guard for error handling
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}