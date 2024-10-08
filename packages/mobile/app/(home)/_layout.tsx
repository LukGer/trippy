import { FullscreenLoading } from "@/src/components/fullscreen-loading";
import { UserContext } from "@/src/context/user-context";
import { trpc } from "@/src/utils/trpc";
import { useAuth } from "@clerk/clerk-expo";
import { skipToken } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function HomeLayout() {
	const { isSignedIn, userId } = useAuth();

	const { data, isLoading, isError, error } = trpc.users.getByClerkId.useQuery(
		!userId
			? skipToken
			: {
					clerkId: userId!,
				},
	);

	if (!isSignedIn) {
		return <Redirect href="/login" />;
	}

	if (isLoading) {
		return <FullscreenLoading />;
	}

	if (!data) {
		return <Redirect href="/login" />;
	}

	if (isError) {
		return (
			<View style={{ flex: 1 }}>
				<Text>Error</Text>
				<Text>{error.message}</Text>
			</View>
		);
	}

	return (
		<UserContext.Provider value={data}>
			<Stack>
				<Stack.Screen
					name="trips/new"
					options={{
						presentation: "formSheet",
					}}
				/>
			</Stack>
		</UserContext.Provider>
	);
}
