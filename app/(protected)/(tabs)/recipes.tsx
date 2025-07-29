import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { H1, Muted } from '@/components/ui/typography';
import { SafeAreaView } from '@/components/safe-area-view';
import { RecipeService } from '@/lib/recipe-service';
import { Recipe } from '@/types/recipe';

export default function RecipesTab() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadRecipes = async () => {
    try {
      const userRecipes = await RecipeService.getUserRecipes();
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load recipes. Please try again.');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const initializeRecipes = async () => {
      setIsLoading(true);
      await loadRecipes();
      setIsLoading(false);
    };
    initializeRecipes();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecipes();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Pressable
      onPress={() => router.push({
        pathname: '/(protected)/recipe/[id]',
        params: { id: recipe.id }
      })}
      className="bg-secondary/50 rounded-lg p-4 gap-y-2 active:bg-secondary"
    >
      <Text className="font-semibold text-lg">{recipe.title}</Text>
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-x-4">
          {recipe.macros?.calories && (
            <Text className="text-sm text-muted-foreground">
              {Math.round(recipe.macros.calories)} cal
            </Text>
          )}
          <Text className="text-sm text-muted-foreground">
            {recipe.ingredients.length} ingredients
          </Text>
          <Text className="text-sm text-muted-foreground">
            {recipe.steps.length} steps
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {formatDate(recipe.created_at)}
        </Text>
      </View>
      {recipe.video_url && (
        <Text className="text-xs text-primary">
          {recipe.video_url.includes('tiktok') ? '📱 TikTok' : '📷 Instagram'}
        </Text>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <View className="gap-y-4 flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <View>
              <H1>My Recipes</H1>
              <Muted>{recipes.length} recipes saved</Muted>
            </View>
            <Button
              onPress={() => router.push('/(protected)/add-recipe')}
              size="sm"
            >
              <Text>Add Recipe</Text>
            </Button>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <Text>Loading recipes...</Text>
            </View>
          ) : recipes.length === 0 ? (
            <View className="flex-1 justify-center items-center gap-y-4">
              <Text className="text-lg font-medium text-center">No recipes yet</Text>
              <Muted className="text-center max-w-sm">
                Start by adding your first recipe from a TikTok or Instagram video!
              </Muted>
              <Button
                onPress={() => router.push('/(protected)/add-recipe')}
              >
                <Text>Add Your First Recipe</Text>
              </Button>
            </View>
          ) : (
            <ScrollView 
              className="flex-1" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View className="gap-y-3">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
