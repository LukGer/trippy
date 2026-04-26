import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
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
						<Link href="/(tabs)/plans/create" asChild>
							<Pressable
								accessibilityLabel="Create plan"
								accessibilityRole="button"
								hitSlop={12}
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
					headerTitleStyle: { color: Colors.ink.primary, fontFamily: Fonts.serif.bold },
					headerLargeTitleStyle: { fontFamily: Fonts.serif.bold },
					headerTransparent: true,
				}}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={styles.container}
			>
				<Text>bla bla bla</Text>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
	}
});