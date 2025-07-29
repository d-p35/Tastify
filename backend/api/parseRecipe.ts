import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Types
interface ParseRecipeRequest {
  videoUrl: string;
}

interface ParseRecipeResponse {
  title: string;
  ingredients: Array<{
    item: string;
    quantity: string;
    notes?: string;
  }>;
  steps: string[];
  macros: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    fiber?: number;
    sugar?: number;
  };
  prep_time?: string;
  cook_time?: string;
  servings?: string;
}

interface VideoMetadata {
  title: string;
  description: string;
  platform: 'tiktok' | 'instagram' | 'unknown';
}

// Initialize Gemini AI
console.log('Initializing Gemini AI with API key:', process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { videoUrl }: ParseRecipeRequest = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'videoUrl is required'
      });
    }

    // Validate URL format
    if (!isValidVideoUrl(videoUrl)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid TikTok or Instagram URL'
      });
    }

    console.log('Processing video URL:', videoUrl);

    // Step 1: Extract metadata from the video URL
    const metadata = await extractVideoMetadata(videoUrl);
    console.log('Extracted metadata:', metadata);

    // Step 2: Use Gemini to parse the recipe
    const recipe = await parseRecipeWithGemini(videoUrl, metadata);
    console.log('Parsed recipe:', recipe);

    // Return the parsed recipe
    return res.status(200).json({
      ...corsHeaders,
      ...recipe
    });

  } catch (error) {
    console.error('Error parsing recipe:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return res.status(500).json({
      ...corsHeaders,
      error: 'Internal server error',
      message: 'Failed to parse recipe from video',
      details: errorMessage
    });
  }
}

function isValidVideoUrl(url: string): boolean {
  const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/;
  const instagramRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/;
  
  return tiktokRegex.test(url) || instagramRegex.test(url);
}

async function extractVideoMetadata(url: string): Promise<VideoMetadata> {
  try {
    // Determine platform
    const platform = url.includes('tiktok') ? 'tiktok' : 
                    url.includes('instagram') ? 'instagram' : 'unknown';

    console.log(`Extracting metadata from ${platform} URL: ${url}`);

    // Fetch the page content with multiple user agents
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    ];

    let bestMetadata = { title: '', description: '', platform: platform as any };

    // Try multiple user agents to get the best metadata
    for (const userAgent of userAgents) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 10000,
          maxRedirects: 5
        });

        const $ = cheerio.load(response.data);
        
        // Extract comprehensive metadata
        const metadata = extractAllMetadata($, platform);
        
        // Keep the most complete metadata
        if ((metadata.title?.length || 0) > bestMetadata.title.length || 
            (metadata.description?.length || 0) > bestMetadata.description.length) {
          bestMetadata = {
            title: metadata.title || bestMetadata.title,
            description: metadata.description || bestMetadata.description,
            platform: metadata.platform
          };
        }
        
        // If we got good data, we can stop
        if ((metadata.title?.length || 0) > 20 && (metadata.description?.length || 0) > 50) {
          break;
        }
        
      } catch (error) {
        console.log(`Failed with user agent ${userAgent}:`, (error as Error).message);
        continue;
      }
    }

    return bestMetadata;

  } catch (error) {
    console.warn('Failed to extract metadata:', error);
    
    // Return basic info based on URL
    const platform = url.includes('tiktok') ? 'tiktok' : 
                    url.includes('instagram') ? 'instagram' : 'unknown';
    
    return {
      title: '',
      description: '',
      platform: platform as 'tiktok' | 'instagram' | 'unknown'
    };
  }
}

function extractAllMetadata($: cheerio.CheerioAPI, platform: string): VideoMetadata {
  // Extract title from multiple sources
  const titleSources = [
    $('meta[property="og:title"]').attr('content'),
    $('meta[name="twitter:title"]').attr('content'),
    $('meta[property="og:site_name"]').attr('content'),
    $('title').text(),
    $('.video-meta-title').text(),
    $('[data-e2e="browse-video-desc"]').text(),
    $('.media-desc').text()
  ].filter(Boolean);

  // Extract description from multiple sources  
  const descriptionSources = [
    $('meta[property="og:description"]').attr('content'),
    $('meta[name="twitter:description"]').attr('content'),
    $('meta[name="description"]').attr('content'),
    $('.video-meta-caption').text(),
    $('[data-e2e="video-desc"]').text(),
    $('.Caption').text(),
    $('script[type="application/ld+json"]').html()
  ].filter(Boolean);

  // Get the longest/most complete text
  const title = titleSources.reduce((longest, current) => 
    current && current.length > (longest?.length || 0) ? current : longest, '') || '';
  
  const description = descriptionSources.reduce((longest, current) => 
    current && current.length > (longest?.length || 0) ? current : longest, '') || '';

  // Try to extract JSON-LD structured data if available
  try {
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    if (jsonLdScript) {
      const jsonData = JSON.parse(jsonLdScript);
      if (jsonData.description && jsonData.description.length > (description?.length || 0)) {
        return {
          title: jsonData.name || jsonData.headline || title || '',
          description: jsonData.description || '',
          platform: platform as any
        };
      }
    }
  } catch (e) {
    // JSON-LD parsing failed, continue with scraped data
  }
  console.log('Extracted title:', title);
    console.log('Extracted description:', description);
    console.log('Extracted platform:', platform);
  return {
    title: (title || '').trim(),
    description: (description || '').trim(),
    platform: platform as 'tiktok' | 'instagram' | 'unknown'
  };
}

async function parseRecipeWithGemini(videoUrl: string, metadata: VideoMetadata): Promise<ParseRecipeResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = createRecipeExtractionPrompt(videoUrl, metadata);
    
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response:', text);

    // Parse the JSON response
    const recipe = parseGeminiResponse(text);
    
    return recipe;

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback to mock data if Gemini fails
    return createFallbackRecipe(metadata);
  }
}

function createRecipeExtractionPrompt(videoUrl: string, metadata: VideoMetadata): string {
  return `
You are a professional recipe extraction AI with extensive knowledge of cooking techniques, ingredients, and popular social media recipes.

Video URL: ${videoUrl}
Platform: ${metadata.platform}
Video Title: ${metadata.title}
Video Description: ${metadata.description}

CONTEXT: This is a ${metadata.platform} video likely showing a cooking process. Based on the title/description and your knowledge of popular recipes on this platform, extract or intelligently infer a complete, practical recipe.

ANALYSIS INSTRUCTIONS:
1. Look for cooking keywords, ingredient mentions, technique hints in the title/description
2. Use your knowledge of popular ${metadata.platform} recipes to fill gaps
3. Consider typical ingredient ratios and cooking methods for this type of dish
4. If minimal info is provided, create a reasonable recipe based on the dish name/type mentioned

RECIPE REQUIREMENTS:
- Create a recipe that someone could actually cook successfully
- Include realistic ingredient quantities and cooking times
- Break down steps logically as they would appear in the video
- Estimate nutrition based on typical ingredients for this dish type
- Make it authentic to what would be shared on ${metadata.platform}

Return in this JSON format:
{
  "title": "Clear, descriptive recipe name",
  "ingredients": [
    {
      "item": "specific ingredient name",
      "quantity": "precise amount with unit",
      "notes": "preparation notes if needed"
    }
  ],
  "steps": [
    "Detailed step 1 with technique and timing",
    "Detailed step 2 with specific instructions"
  ],
  "macros": {
    "calories": realistic_estimate_per_serving,
    "protein": protein_grams,
    "fat": fat_grams,
    "carbs": carb_grams,
    "fiber": fiber_grams
  },
  "prep_time": "realistic prep time",
  "cook_time": "realistic cook time", 
  "servings": "typical serving size"
}

ONLY return valid JSON, no additional text:
`.trim();
}

function parseGeminiResponse(text: string): ParseRecipeResponse {
  try {
    // Clean the response text
    let cleanText = text.trim();
    
    // Remove any markdown code blocks
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON content
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON found in response');
    }
    
    const jsonText = cleanText.substring(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonText);
    
    // Validate the structure
    if (!parsed.title || !parsed.ingredients || !parsed.steps) {
      throw new Error('Invalid recipe structure');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    throw new Error('Failed to parse AI response');
  }
}

function createFallbackRecipe(metadata: VideoMetadata): ParseRecipeResponse {
  // Create a fallback recipe based on platform and available metadata
  const baseTitle = metadata.title || `Delicious ${metadata.platform} Recipe`;
  
  return {
    title: baseTitle.length > 50 ? baseTitle.substring(0, 50) + '...' : baseTitle,
    ingredients: [
      { item: "Main ingredient", quantity: "2 cups", notes: "or as needed" },
      { item: "Seasoning", quantity: "1 tsp", notes: "to taste" },
      { item: "Cooking oil", quantity: "2 tbsp" }
    ],
    steps: [
      "Prepare all ingredients according to the video instructions",
      "Follow the cooking method shown in the video",
      "Season to taste and serve as demonstrated"
    ],
    macros: {
      calories: 300,
      protein: 10,
      fat: 15,
      carbs: 35,
      fiber: 3
    },
    prep_time: "10 minutes",
    cook_time: "15 minutes",
    servings: "2-4"
  };
}
