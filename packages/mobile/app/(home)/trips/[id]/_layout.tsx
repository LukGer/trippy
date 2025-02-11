import { TripContext } from "@/src/hooks/useTrip";
import { trpc } from "@/src/utils/trpc";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

export default function TripLayout() {
	const params = useLocalSearchParams<{ id: string }>();
	const tripId = params.id;

	const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

	if (isLoading || !data) {
		return null;
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<StatusBar barStyle="light-content" />
			<TripContext.Provider value={data}>
				<Stack>
					<Stack.Screen
						name="addExpense"
						options={{ presentation: "formSheet", headerShown: false }}
					/>
				</Stack>
			</TripContext.Provider>
		</>
	);
}
