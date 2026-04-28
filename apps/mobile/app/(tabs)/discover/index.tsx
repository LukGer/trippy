import { Stack } from "expo-router";
import { ScrollView, Text } from "react-native";
import { Colors } from "@/constants/colors";

export default function DiscoverScreen() {
	return (
		<>
			<Stack.Screen
				options={{
					title: "Discover",
					headerBlurEffect: "none",
					headerStyle: { backgroundColor: Colors.surface.canvas },
					headerLargeStyle: { backgroundColor: "transparent" },
					headerLargeTitle: true,
					headerLargeTitleShadowVisible: false,
					headerShadowVisible: false,
					headerTitleStyle: { color: Colors.ink.primary },
					headerTransparent: true,
				}}
			/>
			<ScrollView
				contentContainerClassName="min-h-full flex-grow bg-surface-canvas px-6 pt-6"
				contentInsetAdjustmentBehavior="automatic"
			>
				<Text className="type-large-title max-w-[340px] font-serif-bold text-ink-primary tracking-[-0.8px]">
					Where should we go next?
				</Text>
				<Text className="type-callout mt-4 max-w-[320px] text-ink-secondary">
					Find ideas, places, and inspiration for your next trip.
				</Text>
			</ScrollView>
		</>
	);
}
