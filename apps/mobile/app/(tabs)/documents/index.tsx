import { ScrollView, Text } from "react-native";

export default function DocumentsScreen() {
	return (
		<ScrollView contentContainerClassName="min-h-full flex-grow justify-center bg-surface-canvas p-6">
			<Text className="type-large-title font-serif-bold text-ink-primary">
				Documents
			</Text>
			<Text className="type-callout mt-2 text-ink-secondary">
				Keep tickets, bookings, passports, and trip attachments in one place.
			</Text>
		</ScrollView>
	);
}
