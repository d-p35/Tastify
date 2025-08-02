# iOS Share Extension + Gemini Backend Setup Guide

## 🎯 Overview

This guide will help you set up:
1. **iOS Share Extension** - Allow users to share TikTok/Instagram videos directly to your app using `expo-share-extension`
2. **Gemini AI Backend** - Parse video URLs into structured recipes using Google's Gemini AI

---

## 📱 Part 1: iOS Share Extension Setup (Simple!)

### 1. Installation

Install the required package:

```bash
npx expo install expo-share-extension
```

### 2. Configuration

Update your `app.json` to include the share extension plugin:

```json
{
  "expo": {
    "scheme": "tastify",
    "plugins": [
      "expo-router",
      [
        "expo-share-extension",
        {
          "shareExtensionName": "TastifyShare",
          "shareExtensionDisplayName": "Save to Tastify",
          "shareExtensionActivationRules": {
            "NSExtensionActivationSupportsWebURLWithMaxCount": 1,
            "NSExtensionActivationSupportsText": true
          },
          "shareExtensionViewController": "ShareExtension"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.yourcompany.tastify"
    }
  }
}
```

### 3. Create ShareExtension Component

The `ShareExtension.tsx` component has been created in your project root. This component:

- Validates shared URLs (TikTok/Instagram only)
- Shows a preview of the shared content
- Opens the main app with the shared URL
- Provides a clean, branded UI

### 4. Handle Deep Links in Main App

Update your `app/(protected)/_layout.tsx` to handle incoming URLs:

```tsx
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProtectedLayout() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      // Parse the URL to extract the shared recipe URL
      const urlObj = new URL(url);
      if (urlObj.pathname === '/add-recipe') {
        const sharedUrl = urlObj.searchParams.get('url');
        if (sharedUrl) {
          // Navigate to the modal with the shared URL
          router.push({
            pathname: '/modal',
            params: { sharedUrl: decodeURIComponent(sharedUrl) }
          });
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URLs while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

  // ... rest of your layout component
}
```

### 5. Update Modal to Handle Shared URLs

Update your `app/(protected)/modal.tsx` to process shared URLs:

```tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Modal() {
  const { sharedUrl } = useLocalSearchParams<{ sharedUrl?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (sharedUrl) {
      handleSharedUrl(sharedUrl);
    }
  }, [sharedUrl]);

  const handleSharedUrl = async (url: string) => {
    setIsProcessing(true);
    
    try {
      // Call your backend to parse the recipe
      const response = await fetch('YOUR_BACKEND_URL/api/parseRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const recipe = await response.json();
      
      // Handle the parsed recipe (save to database, show to user, etc.)
      console.log('Parsed recipe:', recipe);
      
    } catch (error) {
      console.error('Error parsing recipe:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ... rest of your modal component
}
```

---

## 🤖 Part 2: Gemini AI Backend Setup

### 1. Backend Structure

Your backend is already set up with the following structure:

```
backend/
├── package.json          # Dependencies for Vercel functions
├── api/
│   └── parseRecipe.ts    # Main parsing function with Gemini AI
└── .env                  # Environment variables (create this)
```

### 2. Environment Variables

Create `backend/.env` with your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from backend directory:**
   ```bash
   cd backend
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add `GEMINI_API_KEY` as an environment variable

### 4. Update App Configuration

Once deployed, update your environment variables to use the backend URL:

```bash
# In your .env file
EXPO_PUBLIC_BACKEND_URL=https://your-project.vercel.app
```

```typescript
// The app will automatically use the environment variable
const parseRecipe = async (url: string) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  if (!BACKEND_URL) {
    throw new Error('Backend URL not configured');
  }
  
  const response = await fetch(`${BACKEND_URL}/api/parseRecipe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  
  return response.json();
};
```

---

## 🚀 Build and Deploy

### 1. Prebuild for iOS

Generate the native iOS project:

```bash
npx expo prebuild --platform ios
```

### 2. Build for iOS

For development:
```bash
npx expo run:ios
```

For production (with EAS):
```bash
eas build --platform ios
```

---

## 🧪 Testing

### Testing the Share Extension

1. **Build and install** the app on your iOS device/simulator
2. **Open TikTok or Instagram** and find a recipe video
3. **Tap the Share button** and look for "Save to Tastify"
4. **Tap "Save to Tastify"** to test the share extension
5. **Verify** that the main app opens and processes the URL

### Testing the Backend

Test your backend directly:

```bash
curl -X POST $EXPO_PUBLIC_BACKEND_URL/api/parseRecipe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tiktok.com/@user/video/123456"}'
```

Or with a specific URL:

```bash
curl -X POST https://your-project.vercel.app/api/parseRecipe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tiktok.com/@user/video/123456"}'
```

### Testing Deep Links

Test deep links manually:

```bash
# iOS Simulator
xcrun simctl openurl booted "tastify://add-recipe?url=https://example.com"

# Physical Device (using Safari)
# Navigate to: tastify://add-recipe?url=https://example.com
```

---

## 🔧 Troubleshooting

### Share Extension Not Appearing

1. **Bundle Identifier**: Make sure it's correctly set in app.json
2. **Activation Rules**: Verify they match the content types you want to share
3. **Clean Build**: Try `npx expo prebuild --clean`

### Deep Links Not Working

1. **URL Scheme**: Verify it's correctly configured in app.json
2. **Linking Setup**: Check that event listeners are properly set up
3. **Test Manually**: Use the xcrun command above to test

### Backend Issues

1. **Environment Variables**: Make sure `GEMINI_API_KEY` is set in Vercel
2. **CORS**: Check that your frontend domain is allowed
3. **Logs**: Check Vercel function logs for errors

### Build Errors

1. **Clean Build**: `npx expo prebuild --clean`
2. **Fix Dependencies**: `npx expo install --fix`
3. **Xcode Setup**: Ensure Xcode is configured for your development team

---

## 📋 Checklist

### Setup Checklist

- [ ] Installed `expo-share-extension`
- [ ] Updated `app.json` with plugin configuration
- [ ] Created `ShareExtension.tsx` component
- [ ] Added deep link handling to protected layout
- [ ] Updated modal to process shared URLs
- [ ] Set up backend with Gemini AI
- [ ] Deployed backend to Vercel
- [ ] Set environment variables in Vercel
- [ ] Updated .env file with EXPO_PUBLIC_BACKEND_URL

### Testing Checklist

- [ ] Share extension appears in iOS share sheet
- [ ] Share extension opens main app with URL
- [ ] Deep links work correctly
- [ ] Backend parses recipes successfully
- [ ] Parsed recipes are saved to database
- [ ] Error handling works for invalid URLs

---

## 🎉 Next Steps

Once everything is working:

1. **Enhance UI**: Customize the share extension appearance
2. **Add Analytics**: Track share extension usage
3. **Error Handling**: Add better error messages and retry logic
4. **Recipe Storage**: Integrate with your Supabase database
5. **User Feedback**: Add loading states and success messages
6. **Content Types**: Support additional platforms (YouTube Shorts, etc.)

## 📚 Resources

- [expo-share-extension Documentation](https://github.com/MaxAst/expo-share-extension)
- [Expo Deep Linking Guide](https://docs.expo.dev/guides/deep-linking/)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments)
