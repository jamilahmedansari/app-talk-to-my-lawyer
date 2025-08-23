import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Signed out successfully' })

  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}