import { ScrollView, Text } from "react-native";

export default function YouScreen() {
	return (
		<ScrollView contentContainerClassName="min-h-full flex-grow justify-center bg-surface-canvas p-6">
			<Text className="type-large-title font-serif-bold text-ink-primary">You</Text>
			<Text className="type-callout mt-2 text-ink-secondary">
				Manage your profile, preferences, and account settings.
			</Text>
		</ScrollView>
	);
}
