import { Stack } from "expo-router";

export default function YouLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "You" }} />
		</Stack>
	);
}
