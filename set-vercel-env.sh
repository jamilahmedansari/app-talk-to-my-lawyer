#!/bin/bash
# Set Vercel environment variables for talk-new-to-my project

echo "Setting environment variables on Vercel..."

# Set for production, preview, and development
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development <<EOF
https://dpvrovxcxwspgbbvysil.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdnJvdnhjeHdzcGdiYnZ5c2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDg0MjgsImV4cCI6MjA3Mjk4NDQyOH0.KaYL6xK951yOZjivQ7MFQOYI7r2335awU1GqIfD5Njc
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdnJvdnhjeHdzcGdiYnZ5c2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwODQyOCwiZXhwIjoyMDcyOTg0NDI4fQ.m0QkSCPbfihU5HnD2REPj2FbEsxJ51P2pTsJV0kGyWs
EOF

vercel env add JWT_SECRET production preview development <<EOF
Q3e+MfRQOMj7TOJjuJVPMs1qYgpbbTxjTaS29He00jD5K/dPrbK/Rg87frQdXCRQuc7adHLE3ySXDIue6JwJHA==
EOF

vercel env add GEMINI_API_KEY production preview development <<EOF
AIzaSyCvKrvyhzRNNystkhkz5Kh92GSNba7UU3Y
EOF

vercel env add NEXT_PUBLIC_GEMINI_MODEL production preview development <<EOF
gemini-1.5-pro
EOF

vercel env add ADMIN_SIGNUP_SECRET production preview development <<EOF
/LWBoKXAA73rBaPptJe7rdv9GYldY0Whx6fdGT9YDro=
EOF

vercel env add NEXT_TELEMETRY_DISABLED production preview development <<EOF
1
EOF

echo "✅ Environment variables set successfully!"
echo ""
echo "Now deploying to production..."
