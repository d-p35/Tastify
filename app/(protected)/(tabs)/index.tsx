import { useRouter } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useSharedContent } from "@/lib/share-extension";

export default function Home() {
	const router = useRouter();
	const { sharedData } = useSharedContent();

	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-6">
			<View className="gap-y-2">
				<H1 className="text-center">Tastify</H1>
				<Muted className="text-center">
					Save and organize recipes from TikTok and Instagram
				</Muted>
			</View>
			
			{sharedData && (
				<View className="w-full bg-primary/10 rounded-lg p-4 gap-y-2">
					<Text className="font-semibold text-center">🎉 New Recipe Shared!</Text>
					<Muted className="text-center text-sm">
						A recipe URL is ready to be processed
					</Muted>
				</View>
			)}
			
			<View className="w-full gap-y-3">
				<Button
					className="w-full"
					variant="default"
					size="default"
					onPress={() => router.push("/(protected)/add-recipe")}
				>
					<Text>{sharedData ? 'Process Shared Recipe' : 'Add Recipe'}</Text>
				</Button>
				
				<Button
					className="w-full"
					variant="outline"
					size="default"
					onPress={() => router.push("/(protected)/recipes")}
				>
					<Text>View My Recipes</Text>
				</Button>
				
				<Button
					className="w-full"
					variant="ghost"
					size="default"
					onPress={() => router.push("/(protected)/modal")}
				>
					<Text>Open Modal</Text>
				</Button>
			</View>
		</View>
	);
}
