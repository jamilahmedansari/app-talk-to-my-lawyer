import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { user: null, error: 'Not authenticated' }
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
      return { 
        user: { id: user.id, email: user.email },
        error: 'User profile not found' 
      }
    }

    return { user: userData, error: null }
  } catch (error) {
    console.error('Get current user error:', error)
    return { user: null, error: 'Internal server error' }
  }
}

export async function requireAuth() {
  const { user, error } = await getCurrentUser()
  
  if (!user) {
    throw new Error(error || 'Authentication required')
  }
  
  return user
}

export async function requireRole(requiredRole: string) {
  const user = await requireAuth()
  
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }
  
  return user
}

export async function requireAnyRole(requiredRoles: string[]) {
  const user = await requireAuth()
  
  if (!requiredRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}`)
  }
  
  return user
}