import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP = 'group.com.tastify.shared';

export interface SharedRecipeData {
  url: string;
  timestamp: number;
}

export const useSharedContent = () => {
  const [sharedData, setSharedData] = useState<SharedRecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    // Handle initial URL if app was opened from share extension
    checkForSharedContent();

    // Listen for URL changes (when app is already running)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    if (event.url.startsWith('tastify://share')) {
      checkForSharedContent();
    }
  };

  const checkForSharedContent = async () => {
    try {
      setIsLoading(true);
      
      // Get shared data from app group
      const sharedUrl = await SharedGroupPreferences.getItem('shared_recipe_url', APP_GROUP);
      const sharedTimestamp = await SharedGroupPreferences.getItem('shared_recipe_timestamp', APP_GROUP);

      if (sharedUrl && sharedTimestamp) {
        const timestamp = parseFloat(sharedTimestamp as string);
        
        // Only process if this is new data (within last 5 minutes)
        const now = Date.now() / 1000;
        if (now - timestamp < 300) { // 5 minutes
          setSharedData({
            url: sharedUrl as string,
            timestamp: timestamp
          });

          // Clear the shared data so it's not processed again
          await SharedGroupPreferences.setItem('shared_recipe_url', null, APP_GROUP);
          await SharedGroupPreferences.setItem('shared_recipe_timestamp', null, APP_GROUP);
        }
      }
    } catch (error) {
      console.error('Error checking for shared content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSharedData = () => {
    setSharedData(null);
  };

  return {
    sharedData,
    isLoading,
    clearSharedData,
    checkForSharedContent
  };
};
