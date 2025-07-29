import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H1, Muted } from '@/components/ui/typography';
import { SafeAreaView } from '@/components/safe-area-view';
import { RecipeService, parseRecipeFromUrl } from '@/lib/recipe-service';
import { useSharedContent } from '@/lib/share-extension';

export default function AddRecipe() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { sharedData, clearSharedData } = useSharedContent();

  // Handle shared content from iOS Share Extension
  useEffect(() => {
    if (sharedData) {
      setUrl(sharedData.url);
      
      // Show a confirmation that we received the shared URL
      Alert.alert(
        'Recipe URL Received!',
        'We found a recipe URL from your share. You can edit it below or tap "Add Recipe" to continue.',
        [{ text: 'Got it', onPress: clearSharedData }]
      );
    }
  }, [sharedData]);

  const isValidUrl = (urlString: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/,
      /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/,
    ];
    return patterns.some(pattern => pattern.test(urlString));
  };

  const handleAddRecipe = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a TikTok or Instagram URL');
      return;
    }

    if (!isValidUrl(url.trim())) {
      Alert.alert('Error', 'Please enter a valid TikTok or Instagram URL');
      return;
    }

    setIsLoading(true);

    try {
      // Parse recipe from URL using AI (placeholder function)
      const parsedRecipe = await parseRecipeFromUrl(url.trim());
      
      // Save recipe to Supabase
      const savedRecipe = await RecipeService.createRecipe({
        title: parsedRecipe.title,
        ingredients: parsedRecipe.ingredients,
        steps: parsedRecipe.steps,
        macros: parsedRecipe.macros,
        video_url: url.trim(),
      });

      Alert.alert(
        'Success!', 
        'Recipe added successfully',
        [
          {
            text: 'View Recipe',
            onPress: () => router.push({
              pathname: '/(protected)/recipe/[id]',
              params: { id: savedRecipe.id }
            })
          }
        ]
      );
      
      // Clear the form
      setUrl('');
    } catch (error) {
      console.error('Error adding recipe:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to add recipe. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="gap-y-6">
          <View className="gap-y-2">
            <H1 className="text-center">Add Recipe</H1>
            <Muted className="text-center">
              Share a TikTok or Instagram video link to automatically extract the recipe
            </Muted>
          </View>

          <View className="gap-y-4">
            <View className="gap-y-2">
              <Label nativeID="url-input">Video URL</Label>
              <Input
                aria-labelledby="url-input"
                placeholder="https://www.tiktok.com/@user/video/123... or https://www.instagram.com/p/ABC..."
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
                returnKeyType="done"
                editable={!isLoading}
                className="text-sm"
              />
              <Muted className="text-xs">
                Supported platforms: TikTok, Instagram
              </Muted>
            </View>

            <Button
              onPress={handleAddRecipe}
              disabled={isLoading || !url.trim()}
              className="w-full"
            >
              <Text>
                {isLoading ? 'Processing Recipe...' : 'Add Recipe'}
              </Text>
            </Button>
          </View>

          <View className="gap-y-2">
            <Text className="font-medium">How it works:</Text>
            <View className="gap-y-1">
              <Text className="text-sm text-muted-foreground">• Copy a video link from TikTok or Instagram</Text>
              <Text className="text-sm text-muted-foreground">• Paste it above and tap "Add Recipe"</Text>
              <Text className="text-sm text-muted-foreground">• AI will extract ingredients, steps, and nutrition info</Text>
              <Text className="text-sm text-muted-foreground">• Your recipe will be saved and ready to organize</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
