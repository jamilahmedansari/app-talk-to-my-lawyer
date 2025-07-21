// Netlify Function to handle API routes
const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const OpenAI = require('openai').default
const { Resend } = require('resend')
const Stripe = require('stripe')

// Initialize services
let openai, resend, stripe

// Initialize only if keys are available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
}

// MongoDB Atlas connection with enhanced configuration for Netlify
let client
let db

async function connectToMongo() {
  if (!client) {
    // Use MongoDB Atlas connection URL - fallback to environment variable
    const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://jamilahmansari:vqY4vYr1H9zUG0eU@cluster1.9grkr55.mongodb.net/'
    const dbName = process.env.DB_NAME || 'letterdash_db'
    
    console.log('Connecting to MongoDB Atlas for Netlify Function...')
    
    // Enhanced connection options for serverless functions
    client = new MongoClient(mongoUrl, {
      // Connection pool settings for serverless
      maxPoolSize: 1, // Limit connection pool size for serverless
      minPoolSize: 0,
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Prevent memory leaks
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      // Additional serverless optimizations
      retryWrites: true,
      w: 'majority'
    })
    
    // Set event listener limits to prevent memory leak warnings
    if (client && client.setMaxListeners) {
      client.setMaxListeners(20)
    }
    
    await client.connect()
    db = client.db(dbName)
    console.log('MongoDB Atlas connected successfully for Netlify Function!')
  }
  return db
}

// Graceful shutdown function
async function closeMongoConnection() {
  if (client) {
    try {
      await client.close()
      client = null
      db = null
      console.log('MongoDB connection closed')
    } catch (error) {
      console.error('Error closing MongoDB connection:', error)
    }
  }
}

// Helper function to handle CORS
function handleCORS(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    ...headers
  }
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Helper function to generate random coupon code
function generateCouponCode() {
  return Math.random().toString(36).substr(2, 9).toUpperCase()
}

// Main handler function
exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for event loop to be empty
  context.callbackWaitsForEmptyEventLoop = false
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: handleCORS(),
      body: '',
    }
  }

  let db
  try {
    const path = event.path.replace('/.netlify/functions/api', '')
    const method = event.httpMethod
    const body = event.body ? JSON.parse(event.body) : {}

    // Connect to MongoDB with improved error handling
    db = await connectToMongo()

    // Root endpoint
    if (path === '/' && method === 'GET') {
      return {
        statusCode: 200,
        headers: handleCORS(),
        body: JSON.stringify({ 
          message: "Talk To My Lawyer API is running on Netlify!",
          timestamp: new Date().toISOString(),
          version: "2.0.1"
        })
      }
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      try {
        await db.admin().ping()
        return {
          statusCode: 200,
          headers: handleCORS(),
          body: JSON.stringify({ 
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        return {
          statusCode: 503,
          headers: handleCORS(),
          body: JSON.stringify({ 
            status: "unhealthy",
            database: "disconnected",
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    // AUTH ROUTES
    // Register - POST /auth/register
    if (path === '/auth/register' && method === 'POST') {
      const { email, password, name, role = 'user' } = body
      
      // Validation
      if (!email || !password || !name) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'All fields are required' })
        }
      }

      if (password.length < 6) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Password must be at least 6 characters' })
        }
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (existingUser) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'User already exists with this email' })
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // Create user
      const user = {
        id: uuidv4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role,
        subscription: {
          status: 'free',
          planId: null,
          packageType: null,
          lettersRemaining: 0,
          currentPeriodEnd: null
        },
        stripeCustomerId: null,
        isActive: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('users').insertOne(user)

      // Create role-specific profile
      if (role === 'contractor') {
        await db.collection('contractors').insertOne({
          id: uuidv4(),
          user_id: user.id,
          points: 0,
          total_signups: 0,
          username: user.name.toLowerCase().replace(/\s+/g, '').substring(0, 5),
          created_at: new Date()
        })
      } else if (role === 'admin') {
        await db.collection('admins').insertOne({
          id: uuidv4(),
          user_id: user.id,
          permissions: ['manage_users', 'manage_contractors', 'manage_letters'],
          created_at: new Date()
        })
      }

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return {
        statusCode: 200,
        headers: handleCORS(),
        body: JSON.stringify({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role, 
            subscription: user.subscription 
          },
          token,
          message: 'Registration successful!'
        })
      }
    }

    // Login - POST /auth/login
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = body
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Email and password are required' })
        }
      }
      
      const user = await db.collection('users').findOne({ 
        email: email.toLowerCase(),
        isActive: true
      })
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return {
          statusCode: 401,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Invalid email or password' })
        }
      }

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return {
        statusCode: 200,
        headers: handleCORS(),
        body: JSON.stringify({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role, 
            subscription: user.subscription || { status: 'free' }
          },
          token,
          message: 'Login successful!'
        })
      }
    }

    // Get current user - GET /auth/me
    if (path === '/auth/me' && method === 'GET') {
      const authHeader = event.headers.authorization || event.headers.Authorization
      if (!authHeader) {
        return {
          statusCode: 401,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'No authorization token provided' })
        }
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return {
          statusCode: 401,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Invalid or expired token' })
        }
      }

      const user = await db.collection('users').findOne({ 
        id: decoded.userId,
        isActive: true
      })
      
      if (!user) {
        return {
          statusCode: 404,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'User not found or deactivated' })
        }
      }

      return {
        statusCode: 200,
        headers: handleCORS(),
        body: JSON.stringify({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role, 
            subscription: user.subscription || { status: 'free' }
          }
        })
      }
    }

    // Register with coupon - POST /auth/register-with-coupon
    if (path === '/auth/register-with-coupon' && method === 'POST') {
      const { email, password, name, role = 'user', couponCode } = body
      
      if (!email || !password || !name) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Email, password, and name are required' })
        }
      }
      
      if (!couponCode) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Coupon code is required' })
        }
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      })
      
      if (existingUser) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'User already exists' })
        }
      }

      // Validate coupon code (Remote Employee username)
      const contractor = await db.collection('contractors').findOne({ username: couponCode })
      if (!contractor) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Invalid referral code' })
        }
      }

      // Create user with 20% discount
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = {
        id: uuidv4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        subscription: { 
          status: 'free',
          discount_percent: 20,
          referred_by: contractor.user_id
        },
        isActive: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('users').insertOne(user)

      // Update contractor stats
      await db.collection('contractors').updateOne(
        { id: contractor.id },
        { 
          $inc: { 
            points: 1,
            total_signups: 1
          },
          $set: { updated_at: new Date() }
        }
      )

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return {
        statusCode: 200,
        headers: handleCORS(),
        body: JSON.stringify({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role, 
            subscription: user.subscription 
          },
          token,
          message: 'Registration successful with 20% discount applied!'
        })
      }
    }

    // Validate coupon - POST /coupons/validate
    if (path === '/coupons/validate' && method === 'POST') {
      const { coupon_code, couponCode } = body
      const code = coupon_code || couponCode
      
      if (!code) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ error: 'Referral code is required' })
        }
      }

      const contractor = await db.collection('contractors').findOne({ username: code })
      if (!contractor) {
        return {
          statusCode: 400,
          headers: handleCORS(),
          body: JSON.stringify({ 
            valid: false, 
            error: 'Invalid referral code' 
          })
        }
      }

      return {
        statusCode: 200,
        headers: handleCORS(),
        body: JSON.stringify({ 
          valid: true,
          discount_percent: 20,
          message: 'Valid referral code - 20% discount will be applied'
        })
      }
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers: handleCORS(),
      body: JSON.stringify({ error: 'Endpoint not found' })
    }

  } catch (error) {
    console.error('API Error:', error)
    return {
      statusCode: 500,
      headers: handleCORS(),
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
