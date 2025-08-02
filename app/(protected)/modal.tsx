import { View, Alert } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { H1, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Modal() {
	const { sharedUrl } = useLocalSearchParams<{ sharedUrl?: string }>();
	const [isProcessing, setIsProcessing] = useState(false);
	const [recipe, setRecipe] = useState<any>(null);

	useEffect(() => {
		if (sharedUrl) {
			handleSharedUrl(sharedUrl);
		}
	}, [sharedUrl]);

	const handleSharedUrl = async (url: string) => {
		setIsProcessing(true);
		
		try {
			// Get backend URL from environment variable
			const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
			
			if (!BACKEND_URL) {
				throw new Error('Backend URL not configured. Please set EXPO_PUBLIC_BACKEND_URL in your .env file.');
			}
			
			const response = await fetch(`${BACKEND_URL}/api/parseRecipe`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url }),
			});

			if (!response.ok) {
				throw new Error('Failed to parse recipe');
			}

			const parsedRecipe = await response.json();
			setRecipe(parsedRecipe);
			
			// TODO: Save recipe to Supabase database
			console.log('Parsed recipe:', parsedRecipe);
			
		} catch (error) {
			console.error('Error parsing recipe:', error);
			Alert.alert(
				'Error',
				'Failed to parse the recipe. Please try again.',
				[{ text: 'OK' }]
			);
		} finally {
			setIsProcessing(false);
		}
	};

	if (sharedUrl) {
		return (
			<View className="flex flex-1 bg-background p-6 gap-y-6">
				<View className="items-center gap-y-2">
					<H1 className="text-center">Processing Recipe</H1>
					<Muted className="text-center">
						{isProcessing ? 'Analyzing video content...' : 'Recipe processed!'}
					</Muted>
				</View>

				{isProcessing && (
					<View className="bg-secondary/50 rounded-lg p-4">
						<Text className="text-center">🤖 AI is analyzing your recipe video...</Text>
					</View>
				)}

				{recipe && (
					<View className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 gap-y-2">
						<Text className="font-medium text-green-800 dark:text-green-200">
							✓ Recipe Parsed Successfully!
						</Text>
						<Text className="text-sm text-green-700 dark:text-green-300">
							Title: {recipe.title || 'Untitled Recipe'}
						</Text>
						<Text className="text-sm text-green-700 dark:text-green-300">
							Ingredients: {recipe.ingredients?.length || 0} items
						</Text>
						<Text className="text-sm text-green-700 dark:text-green-300">
							Steps: {recipe.instructions?.length || 0} steps
						</Text>
					</View>
				)}

				<View className="bg-secondary/50 rounded-lg p-4">
					<Text className="text-sm font-medium mb-2">Shared URL:</Text>
					<Text className="text-xs text-muted-foreground" numberOfLines={2}>
						{sharedUrl}
					</Text>
				</View>

				{recipe && (
					<Button className="w-full">
						<Text>Save Recipe to Collection</Text>
					</Button>
				)}
			</View>
		);
	}

	return (
		<View className="flex flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Add Recipe</H1>
			<Muted className="text-center">
				Share a TikTok or Instagram recipe video to get started!
			</Muted>
		</View>
	);
}
