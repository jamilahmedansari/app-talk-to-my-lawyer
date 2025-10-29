#!/bin/bash
# Netlify Deployment Setup Script

echo "========================================"
echo "Netlify Deployment Setup for Talk-To-My-Lawyer"
echo "========================================"
echo ""

# Check if authenticated
echo "Step 1: Checking Netlify authentication..."
if npx netlify-cli status > /dev/null 2>&1; then
    echo "✅ Already authenticated with Netlify"
else
    echo "⚠️  Not authenticated. Please run: npx netlify-cli login"
    echo "   This will open a browser for authentication"
    exit 1
fi

echo ""
echo "Step 2: Linking repository to Netlify..."
echo ""

# Try to link existing site or create new one
npx netlify-cli link --name talk-to-my-lawyer-app 2>/dev/null || {
    echo "Creating new site..."
    npx netlify-cli sites:create --name talk-to-my-lawyer-app
}

echo ""
echo "Step 3: Setting environment variables..."
echo ""

# Read from .env.local and set on Netlify
if [ -f .env.local ]; then
    echo "Setting Supabase environment variables..."
    
    # Extract values from .env.local
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
    SUPABASE_ANON=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
    SUPABASE_SERVICE=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2)
    JWT_SECRET=$(grep JWT_SECRET .env.local | cut -d '=' -f2)
    GEMINI_KEY=$(grep GEMINI_API_KEY .env.local | cut -d '=' -f2)
    GEMINI_MODEL=$(grep NEXT_PUBLIC_GEMINI_MODEL .env.local | cut -d '=' -f2)
    ADMIN_SECRET=$(grep ADMIN_SIGNUP_SECRET .env.local | cut -d '=' -f2)
    
    npx netlify-cli env:set NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
    npx netlify-cli env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON"
    npx netlify-cli env:set SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE"
    npx netlify-cli env:set JWT_SECRET "$JWT_SECRET"
    npx netlify-cli env:set GEMINI_API_KEY "$GEMINI_KEY"
    npx netlify-cli env:set NEXT_PUBLIC_GEMINI_MODEL "$GEMINI_MODEL"
    npx netlify-cli env:set ADMIN_SIGNUP_SECRET "$ADMIN_SECRET"
    npx netlify-cli env:set NEXT_TELEMETRY_DISABLED "1"
    
    echo "✅ Environment variables set"
else
    echo "⚠️  .env.local not found. Please set environment variables manually."
fi

echo ""
echo "Step 4: Building and deploying to production..."
echo ""

npx netlify-cli deploy --prod --build

echo ""
echo "========================================"
echo "✅ Deployment complete!"
echo "========================================"
echo ""
echo "Run 'npx netlify-cli open' to view your site"
echo "Run 'npx netlify-cli open:admin' to manage your site"
