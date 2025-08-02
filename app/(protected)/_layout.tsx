import { Stack } from "expo-router";
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProtectedLayout() {
	const router = useRouter();

	useEffect(() => {
		const handleDeepLink = (url: string) => {
			console.log('Deep link received:', url);
			
			try {
				// Parse the URL to extract the shared recipe URL
				const urlObj = new URL(url);
				if (urlObj.pathname === '/add-recipe') {
					const sharedUrl = urlObj.searchParams.get('url');
					if (sharedUrl) {
						// Navigate to the modal with the shared URL
						router.push({
							pathname: '/modal',
							params: { sharedUrl: decodeURIComponent(sharedUrl) }
						});
					}
				}
			} catch (error) {
				console.error('Error parsing deep link:', error);
			}
		};

		// Handle initial URL if app was opened via deep link
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink(url);
			}
		});

		// Handle URLs while app is running
		const subscription = Linking.addEventListener('url', ({ url }) => {
			handleDeepLink(url);
		});

		return () => {
			subscription?.remove();
		};
	}, [router]);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
		</Stack>
	);
}
