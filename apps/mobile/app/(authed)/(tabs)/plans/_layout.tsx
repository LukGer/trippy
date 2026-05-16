import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function PlansLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Plans" }} />
			<Stack.Screen
				name="[tripId]"
				options={{
					headerTransparent: true,
					headerStyle: { backgroundColor: "transparent" },
					headerBackground: () => null,
					headerTitle: "",
					headerLargeTitle: false,
					headerTintColor: Colors.ink.primary,
				}}
			/>
		</Stack>
	);
}
