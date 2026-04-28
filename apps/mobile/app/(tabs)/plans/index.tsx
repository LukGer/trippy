import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function PlansScreen() {
	return (
		<>
			<Stack.Screen
				options={{
					title: "Plans",
					headerBlurEffect: "none",
					headerLargeStyle: { backgroundColor: "transparent" },
					headerLargeTitle: true,
					headerLargeTitleShadowVisible: false,
					headerRight: () => (
						<Link href="/plans/create" asChild>
							<Pressable
								accessibilityLabel="Create plan"
								accessibilityRole="button"
								hitSlop={12}
								className="flex items-center justify-center"
							>
								<SymbolView
									name="plus.circle"
									size={24}
									tintColor={Colors.accent.orange}
								/>
							</Pressable>
						</Link>
					),
					headerShadowVisible: false,
					headerTitleStyle: {
						color: Colors.ink.primary,
						fontFamily: Fonts.serif.bold,
					},
					headerLargeTitleStyle: { fontFamily: Fonts.serif.bold },
					headerTransparent: true,
				}}
			/>
			<ScrollView
				contentContainerClassName="flex-grow px-6 pt-6"
				contentInsetAdjustmentBehavior="automatic"
			>
				<Text className="type-body text-ink-secondary">bla bla bla</Text>
			</ScrollView>
		</>
	);
}
