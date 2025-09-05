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

    if (userError || userData?.role !== 'contractor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get contractor stats
    const { data: contractorData, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (contractorError) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 })
    }

    // Mock recent activity for now - this could be expanded with actual activity tracking
    const recentActivity = [
      {
        description: 'New user signed up via referral',
        date: new Date().toLocaleDateString()
      }
    ]

    return NextResponse.json({
      points: contractorData.points || 0,
      totalSignups: contractorData.total_signups || 0,
      username: contractorData.username,
      recentActivity
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}