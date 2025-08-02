#!/bin/bash

# Environment Setup Script for Tastify
# This script helps create the .env file with the correct variables

echo "🔧 Setting up environment variables..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp .env .env.backup
fi

# Copy from example
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
else
    echo "❌ .env.example not found"
    exit 1
fi

echo ""
echo "📝 Please edit your .env file with the following:"
echo "1. Add your Supabase URL and anon key"
echo "2. After deploying your backend, add your Vercel URL to EXPO_PUBLIC_BACKEND_URL"
echo ""
echo "Example:"
echo "EXPO_PUBLIC_BACKEND_URL=https://your-project-abc123.vercel.app"
echo ""
echo "💡 You can get your backend URL by running 'npx vercel' in the backend/ directory"
