import { Redirect, Stack } from "expo-router";
import { authClient } from "@/src/utils/auth";

export default function UnauthedLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) return null;

	if (session?.user) {
		return <Redirect href="/(authed)/(tabs)/discover" />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
}
