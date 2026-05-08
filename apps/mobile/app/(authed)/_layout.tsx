import { Redirect, Stack } from "expo-router";
import { authClient } from "@/src/utils/auth";

export default function AuthedLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) return null;

	if (!session?.user) {
		return <Redirect href="/(unauthed)" />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="plans" options={{ presentation: "formSheet" }} />
		</Stack>
	);
}
