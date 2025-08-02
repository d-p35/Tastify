import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { close, openHostApp } from 'expo-share-extension';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

interface ShareExtensionProps {
  url?: string;
  text?: string;
}

export default function ShareExtension({ url, text }: ShareExtensionProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine what kind of content was shared
  const sharedContent = url || text || '';
  const isValidUrl = sharedContent && (
    sharedContent.includes('tiktok.com') || 
    sharedContent.includes('instagram.com')
  );

  const handleSaveRecipe = async () => {
    if (!isValidUrl) {
      Alert.alert(
        'Invalid Content',
        'Please share a TikTok or Instagram video URL to save as a recipe.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Open the main app with the shared URL
      const encodedUrl = encodeURIComponent(sharedContent);
      await openHostApp(`add-recipe?url=${encodedUrl}`);
      
      // Close the share extension after a short delay
      setTimeout(() => {
        close();
      }, 500);
    } catch (error) {
      console.error('Error opening main app:', error);
      Alert.alert(
        'Error',
        'Failed to open the main app. Please try again.',
        [{ text: 'OK' }]
      );
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    close();
  };

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="gap-y-6">
        {/* Header */}
        <View className="items-center gap-y-2">
          <H1 className="text-center">Save to Tastify</H1>
          <Muted className="text-center">
            Turn this recipe into an organized, searchable format
          </Muted>
        </View>

        {/* Content Preview */}
        <View className="bg-secondary/50 rounded-lg p-4 gap-y-2">
          <Text className="font-medium">Shared Content:</Text>
          <Text className="text-sm text-muted-foreground" numberOfLines={3}>
            {sharedContent || 'No content detected'}
          </Text>
          
          {isValidUrl && (
            <View className="flex-row items-center gap-x-2 mt-2">
              <Text className="text-xs text-primary">
                {sharedContent.includes('tiktok') ? '📱 TikTok' : '📷 Instagram'}
              </Text>
              <Text className="text-xs text-green-600">✓ Recipe URL detected</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-y-3">
          <Button
            onPress={handleSaveRecipe}
            disabled={!isValidUrl || isProcessing}
            className="w-full"
          >
            <Text>
              {isProcessing ? 'Opening Tastify...' : 'Save Recipe'}
            </Text>
          </Button>

          <Button
            variant="outline"
            onPress={handleCancel}
            disabled={isProcessing}
            className="w-full"
          >
            <Text>Cancel</Text>
          </Button>
        </View>

        {!isValidUrl && (
          <View className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3">
            <Text className="text-orange-800 dark:text-orange-200 text-xs text-center">
              💡 Tip: Share from TikTok or Instagram recipe videos to save them to your collection
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
