import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { H1, H2, Muted } from '@/components/ui/typography';
import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { RecipeService } from '@/lib/recipe-service';
import { Recipe, Ingredient } from '@/types/recipe';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setIsLoading(true);
      const recipeData = await RecipeService.getRecipe(id!);
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert(
        'Error',
        'Failed to load recipe. Please try again.',
        [
          {
            text: 'Go Back',
            onPress: () => router.back()
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatMacroValue = (value: number | undefined) => {
    return value ? Math.round(value) : '-';
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4 gap-y-4">
          <Text>Recipe not found</Text>
          <Button onPress={() => router.back()}>
            <Text>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="gap-y-6">
          {/* Header */}
          <View className="gap-y-2">
            <H1 className="text-center">{recipe.title}</H1>
            {recipe.video_url && (
              <Muted className="text-center text-xs">
                Source: {recipe.video_url.includes('tiktok') ? 'TikTok' : 'Instagram'}
              </Muted>
            )}
          </View>

          {/* Nutrition Info */}
          {recipe.macros && Object.keys(recipe.macros).length > 0 && (
            <View className="gap-y-3">
              <H2>Nutrition Info</H2>
              <View className="flex-row flex-wrap gap-4">
                {recipe.macros.calories && (
                  <View className="bg-secondary rounded-lg p-3 min-w-[80px] items-center">
                    <Text className="text-lg font-bold">{formatMacroValue(recipe.macros.calories)}</Text>
                    <Text className="text-xs text-muted-foreground">Calories</Text>
                  </View>
                )}
                {recipe.macros.protein && (
                  <View className="bg-secondary rounded-lg p-3 min-w-[80px] items-center">
                    <Text className="text-lg font-bold">{formatMacroValue(recipe.macros.protein)}g</Text>
                    <Text className="text-xs text-muted-foreground">Protein</Text>
                  </View>
                )}
                {recipe.macros.carbs && (
                  <View className="bg-secondary rounded-lg p-3 min-w-[80px] items-center">
                    <Text className="text-lg font-bold">{formatMacroValue(recipe.macros.carbs)}g</Text>
                    <Text className="text-xs text-muted-foreground">Carbs</Text>
                  </View>
                )}
                {recipe.macros.fat && (
                  <View className="bg-secondary rounded-lg p-3 min-w-[80px] items-center">
                    <Text className="text-lg font-bold">{formatMacroValue(recipe.macros.fat)}g</Text>
                    <Text className="text-xs text-muted-foreground">Fat</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Ingredients */}
          <View className="gap-y-3">
            <H2>Ingredients</H2>
            <View className="gap-y-2">
              {recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                <View key={index} className="flex-row items-center gap-x-3 bg-secondary/50 rounded-lg p-3">
                  <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                    <Text className="text-primary-foreground text-xs font-bold">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium">{ingredient.item}</Text>
                    <Text className="text-sm text-muted-foreground">{ingredient.quantity}</Text>
                    {ingredient.notes && (
                      <Text className="text-xs text-muted-foreground italic">{ingredient.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="gap-y-3">
            <H2>Instructions</H2>
            <View className="gap-y-3">
              {recipe.steps.map((step: string, index: number) => (
                <View key={index} className="flex-row gap-x-3">
                  <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mt-1">
                    <Text className="text-primary-foreground text-sm font-bold">{index + 1}</Text>
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="leading-6">{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="gap-y-3 pb-4">
            <Button 
              onPress={() => router.back()}
              variant="outline"
            >
              <Text>Back to Recipes</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
