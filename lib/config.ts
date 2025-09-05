export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  
  // Stripe configuration
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  
  // App configuration
  app: {
    name: 'Talk-to-My-Lawyer',
    description: 'Professional Legal Letters | Local Lawyer Drafter Letter for Conflict Resolution',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Feature flags
  features: {
    enableOpenAI: process.env.ENABLE_OPENAI === 'true',
    enableStripe: process.env.ENABLE_STRIPE === 'true',
    enableEmail: process.env.ENABLE_EMAIL === 'true',
  }
}

// Validate required environment variables
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Check if we're in production
export const isProduction = config.app.environment === 'production'
export const isDevelopment = config.app.environment === 'development'