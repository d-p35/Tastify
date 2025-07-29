# iOS Share Extension + Gemini Backend Setup Guide

## 🎯 Overview

This guide will help you set up:
1. **iOS Share Extension** - Allow users to share TikTok/Instagram videos directly to your app
2. **Gemini AI Backend** - Parse video URLs into structured recipes using Google's Gemini AI

---

## 📱 Part 1: iOS Share Extension Setup

### 1. Xcode Configuration

1. **Open your project in Xcode:**
   ```bash
   cd ios
   open ExpoSupabaseStarter.xcworkspace
   ```

2. **Add Share Extension Target:**
   - In Xcode, select your project in the navigator
   - Click the `+` button at the bottom of the targets list
   - Choose `iOS > Share Extension`
   - Name it `ShareExtension`
   - Set the Bundle Identifier to: `your.app.bundle.id.ShareExtension`

3. **Configure Share Extension Files:**
   - Replace the generated files with the ones we created:
     - `ShareViewController.swift`
     - `Info.plist`
     - `MainInterface.storyboard`

4. **Add App Groups:**
   - Select your main app target
   - Go to `Signing & Capabilities`
   - Add `App Groups` capability
   - Add group: `group.com.tastify.shared`
   - Repeat for the Share Extension target

5. **Update Bundle Identifiers:**
   - Main app: Update to your desired bundle ID
   - Share extension: Should be `{main-bundle-id}.ShareExtension`

### 2. Test the Share Extension

1. **Build and run** your app on a physical device
2. **Open TikTok or Instagram** 
3. **Share a video** and look for "Save to Tastify" in the share sheet
4. **Tap it** - it should open your main app

---

## 🤖 Part 2: Gemini Backend Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy the backend:**
   ```bash
   cd backend
   vercel
   ```

3. **Set environment variables:**
   ```bash
   vercel env add GEMINI_API_KEY
   # Paste your Gemini API key when prompted
   ```

4. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

5. **Note your deployment URL** (e.g., `https://your-project.vercel.app`)

### 3. Update Frontend Configuration

1. **Update the API URL in `lib/recipe-service.ts`:**
   ```typescript
   const response = await fetch('https://your-project.vercel.app/api/parseRecipe', {
   ```

2. **Test the integration:**
   - Add a recipe with a TikTok/Instagram URL
   - The app should call your Vercel backend
   - Gemini AI will parse the recipe

---

## 🔧 Part 3: Final Integration

### 1. iOS App Configuration

**Update `app.json` for the share extension:**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.tastify"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "12.0"
          }
        }
      ]
    ]
  }
}
```

### 2. Build and Test

1. **Build the iOS app:**
   ```bash
   npx expo run:ios
   ```

2. **Test the complete flow:**
   - Share a TikTok video to your app
   - App should open with the URL pre-filled
   - Tap "Add Recipe" to process with Gemini AI
   - Recipe should be parsed and saved to Supabase

---

## 🚀 Part 4: Deployment

### 1. Backend Deployment Checklist

- ✅ Gemini API key configured in Vercel
- ✅ CORS headers configured for your app domain
- ✅ Error handling and fallbacks implemented
- ✅ API endpoint URL updated in frontend

### 2. iOS App Deployment

- ✅ Share Extension properly configured in Xcode
- ✅ App Groups set up for data sharing
- ✅ Bundle identifiers configured correctly
- ✅ Custom URL scheme added to Info.plist
- ✅ App built and tested on physical device

---

## 🔍 Testing Guide

### Backend Testing

1. **Test the API directly:**
   ```bash
   curl -X POST https://your-project.vercel.app/api/parseRecipe \
     -H "Content-Type: application/json" \
     -d '{"videoUrl": "https://www.tiktok.com/@user/video/123"}'
   ```

2. **Expected response:**
   ```json
   {
     "title": "Recipe Name",
     "ingredients": [...],
     "steps": [...],
     "macros": {...}
   }
   ```

### iOS Share Extension Testing

1. **From TikTok:**
   - Open TikTok app
   - Find a recipe video
   - Tap share button
   - Look for "Save to Tastify"
   - Tap it → should open your app

2. **From Instagram:**
   - Open Instagram app
   - Find a recipe post/reel
   - Tap share button
   - Look for "Save to Tastify"
   - Tap it → should open your app

---

## ⚠️ Troubleshooting

### Common Issues

1. **Share Extension doesn't appear:**
   - Check App Groups configuration
   - Verify bundle identifiers
   - Rebuild and reinstall app

2. **Backend API errors:**
   - Check Vercel logs: `vercel logs`
   - Verify Gemini API key is set
   - Test with curl first

3. **App doesn't open from share:**
   - Check custom URL scheme in Info.plist
   - Verify share extension implementation
   - Check device logs in Xcode

### Debug Tips

1. **Enable Xcode debugging** for share extension
2. **Check Vercel function logs** for backend issues
3. **Use React Native Flipper** for frontend debugging
4. **Test with simple URLs first** before complex ones

---

## 📋 File Structure Summary

```
Tastify/
├── ios/
│   └── ShareExtension/
│       ├── ShareViewController.swift
│       ├── Info.plist
│       └── MainInterface.storyboard
├── backend/
│   ├── api/
│   │   └── parseRecipe.ts
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
├── lib/
│   ├── share-extension.ts
│   └── recipe-service.ts (updated)
└── app/(protected)/
    ├── add-recipe.tsx (updated)
    └── (tabs)/
        └── index.tsx (updated)
```

Your Tastify app now supports:
- ✅ iOS Share Extension for TikTok/Instagram
- ✅ Gemini AI-powered recipe parsing
- ✅ Seamless integration with existing recipe system
- ✅ Fallback support for when services are unavailable

🎉 **Users can now share recipes directly from social media to your app!**
