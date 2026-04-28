import { Stack } from "expo-router";

/**
 * Root-level stack (sibling to (tabs)), so the create flow is not inside NativeTabs — tab bar stays hidden.
 */
export default function PlansModalLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				presentation: "pageSheet",
			}}
		>
			<Stack.Screen name="create" />
		</Stack>
	);
}
