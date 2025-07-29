# Tastify Backend - Recipe Parsing API

A serverless function that uses Google Gemini AI to parse TikTok and Instagram video URLs into structured recipe data.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Run Locally
```bash
npx vercel dev
```

### 4. Test the API
```bash
curl -X POST http://localhost:3000/api/parseRecipe \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.tiktok.com/@gordonramsayofficial/video/7234567890123456789"
  }'
```

## 🌐 Deploy to Vercel

### 1. Deploy
```bash
vercel
```

### 2. Set Environment Variables
```bash
vercel env add GEMINI_API_KEY
# Enter your Gemini API key when prompted
```

### 3. Redeploy with Environment Variables
```bash
vercel --prod
```

## 📋 API Documentation

### POST /api/parseRecipe

**Request:**
```json
{
  "videoUrl": "string" // Required: TikTok or Instagram video URL
}
```

**Response:**
```json
{
  "title": "Recipe Name",
  "ingredients": [
    {
      "item": "ingredient name",
      "quantity": "amount with unit",
      "notes": "optional preparation notes"
    }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "macros": {
    "calories": 420,
    "protein": 15,
    "fat": 12,
    "carbs": 65,
    "fiber": 4
  },
  "prep_time": "10 minutes",
  "cook_time": "15 minutes",
  "servings": "2-4"
}
```

**Supported URLs:**
- TikTok: `https://www.tiktok.com/@user/video/...`
- TikTok (short): `https://vm.tiktok.com/...`
- Instagram: `https://www.instagram.com/p/...`
- Instagram: `https://www.instagram.com/reel/...`

## 🔧 How It Works

1. **URL Validation**: Checks if the provided URL is from TikTok or Instagram
2. **Metadata Extraction**: Scrapes the video page for title, description, and other metadata
3. **AI Processing**: Sends the metadata to Google Gemini AI with a structured prompt
4. **Response Parsing**: Converts the AI response into structured recipe JSON
5. **Fallback Handling**: Returns mock data if any step fails

## 🛠️ Development

### Project Structure
```
backend/
├── api/
│   └── parseRecipe.ts    # Main API endpoint
├── package.json          # Dependencies
├── tsconfig.json        # TypeScript config
├── vercel.json          # Vercel configuration
└── .env.example         # Environment variables template
```

### Key Features
- ✅ Google Gemini AI integration
- ✅ TikTok and Instagram URL support
- ✅ OpenGraph metadata extraction
- ✅ Robust error handling
- ✅ CORS support
- ✅ TypeScript for type safety
- ✅ Fallback responses when AI fails

### Testing Different URLs

**TikTok Recipe Example:**
```bash
curl -X POST http://localhost:3000/api/parseRecipe \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.tiktok.com/@cookingwithlynja/video/7234567890"}'
```

**Instagram Recipe Example:**
```bash
curl -X POST http://localhost:3000/api/parseRecipe \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.instagram.com/p/CwXYZ123456/"}'
```

## 🔒 Security

- API keys are stored securely in Vercel environment variables
- CORS headers prevent unauthorized access
- Input validation prevents malicious URLs
- Rate limiting can be added if needed

## 📈 Monitoring

Check your Vercel dashboard for:
- Function invocations
- Error rates
- Response times
- Usage limits

## 🐛 Troubleshooting

**Common Issues:**

1. **"Invalid API key" error:**
   - Verify your Gemini API key is correct
   - Check it's properly set in Vercel environment variables

2. **"Failed to extract metadata" warning:**
   - The video URL might be private or unavailable
   - The function will still work with fallback data

3. **"AI parsing failed" error:**
   - Gemini API might be temporarily unavailable
   - The function returns mock data as fallback

4. **CORS errors in browser:**
   - Check the `ALLOWED_ORIGINS` environment variable
   - Add your frontend domain to the allowed origins

## 💡 Tips

- Test locally first before deploying
- Monitor Vercel function logs for debugging
- Consider adding caching for frequently requested URLs
- The AI prompt can be customized for better results
- Add rate limiting for production use

Your recipe parsing backend is now ready to turn social media videos into structured recipes! 🍳
