#!/bin/bash
# Set Netlify environment variables

export NETLIFY_AUTH_TOKEN="nfp_4vwLHN1XeLWc5Q7RubPXe27w4wbV4x7o4d1a"

echo "Setting environment variables on Netlify..."

npx netlify-cli env:set NEXT_PUBLIC_SUPABASE_URL "https://dpvrovxcxwspgbbvysil.supabase.co"
npx netlify-cli env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdnJvdnhjeHdzcGdiYnZ5c2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDg0MjgsImV4cCI6MjA3Mjk4NDQyOH0.KaYL6xK951yOZjivQ7MFQOYI7r2335awU1GqIfD5Njc"
npx netlify-cli env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdnJvdnhjeHdzcGdiYnZ5c2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwODQyOCwiZXhwIjoyMDcyOTg0NDI4fQ.m0QkSCPbfihU5HnD2REPj2FbEsxJ51P2pTsJV0kGyWs"
npx netlify-cli env:set JWT_SECRET "Q3e+MfRQOMj7TOJjuJVPMs1qYgpbbTxjTaS29He00jD5K/dPrbK/Rg87frQdXCRQuc7adHLE3ySXDIue6JwJHA=="
npx netlify-cli env:set GEMINI_API_KEY "AIzaSyCvKrvyhzRNNystkhkz5Kh92GSNba7UU3Y"
npx netlify-cli env:set NEXT_PUBLIC_GEMINI_MODEL "gemini-1.5-pro"
npx netlify-cli env:set ADMIN_SIGNUP_SECRET "your-admin-secret-here"
npx netlify-cli env:set NEXT_TELEMETRY_DISABLED "1"

echo "✅ Environment variables set successfully!"
echo ""
echo "You can verify them at:"
echo "https://app.netlify.com/projects/talk-to-my-lawyer-v2/configuration/env"
