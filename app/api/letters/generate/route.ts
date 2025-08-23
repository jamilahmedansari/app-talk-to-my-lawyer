import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireAuth } from '@/lib/auth-helpers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      letterType = 'complaint',
      formData = {},
      urgencyLevel = 'standard'
    } = body

    // Check if user has letters remaining (for subscription logic)
    if (user.subscription_letters_remaining <= 0 && user.subscription_status === 'free') {
      return NextResponse.json({ 
        error: 'No letters remaining. Please upgrade your subscription.' 
      }, { status: 400 })
    }

    // Generate letter with OpenAI
    const systemPrompt = `You are a professional legal letter writer. Generate a professional, legally sound ${letterType} letter based on the provided information.`
    
    const userPrompt = `Generate a ${letterType} letter with the following details: ${JSON.stringify(formData, null, 2)}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const letterContent = completion.choices[0]?.message?.content || ''

    // Save letter to database
    const { data: letter, error: letterError } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        title: `${letterType} Letter - ${new Date().toLocaleDateString()}`,
        content: letterContent,
        letter_type: letterType,
        form_data: formData,
        urgency_level: urgencyLevel,
        status: 'ready',
        stage: 4,
        professional_generated: true,
      })
      .select()
      .single()

    if (letterError) {
      console.error('Error saving letter:', letterError)
      return NextResponse.json({ error: 'Failed to save letter' }, { status: 500 })
    }

    // Update user's remaining letters
    if (user.subscription_status !== 'unlimited') {
      await supabase
        .from('users')
        .update({ 
          subscription_letters_remaining: Math.max(0, user.subscription_letters_remaining - 1) 
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      message: 'Letter generated successfully',
      letter,
      remaining_letters: Math.max(0, user.subscription_letters_remaining - 1)
    })

  } catch (error) {
    console.error('Error generating letter:', error)
    
    // Type-safe error handling
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}