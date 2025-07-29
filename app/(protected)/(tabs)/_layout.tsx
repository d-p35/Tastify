import React from "react";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: true,
			}}
		>
			<Tabs.Screen 
				name="index" 
				options={{ 
					title: "Home",
					tabBarLabel: "Home"
				}} 
			/>
			<Tabs.Screen 
				name="recipes" 
				options={{ 
					title: "Recipes",
					tabBarLabel: "Recipes"
				}} 
			/>
			<Tabs.Screen 
				name="settings" 
				options={{ 
					title: "Settings",
					tabBarLabel: "Settings"
				}} 
			/>
		</Tabs>
	);
}
