#!/bin/bash

# Tastify Share Extension Setup Script
# This script helps deploy the backend and configure the iOS app

echo "🍳 Tastify Share Extension Setup"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Tastify project root"
    exit 1
fi

echo "📦 Installing dependencies..."
npx expo install --fix

echo "🔧 Setting up share extension..."
if ! grep -q "expo-share-extension" package.json; then
    echo "Installing expo-share-extension..."
    npx expo install expo-share-extension
fi

echo "🏗️  Prebuilding iOS project..."
npx expo prebuild --platform ios --clean

echo "🚀 Backend deployment instructions:"
echo "1. cd backend"
echo "2. Copy .env.template to .env and add your GEMINI_API_KEY"
echo "3. Run 'npx vercel' to deploy"
echo "4. Update EXPO_PUBLIC_BACKEND_URL in your .env file with your Vercel URL"

echo ""
echo "📱 iOS testing instructions:"
echo "1. Run 'npx expo run:ios'"
echo "2. Install the app on device/simulator"
echo "3. Test sharing from TikTok/Instagram"

echo ""
echo "✅ Setup complete! Check SHARE_EXTENSION_SETUP_NEW.md for detailed instructions."
