import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { PlansEmptyState } from "@/src/components/plans/plans-empty-state";
import { PlansList } from "@/src/components/plans/plans-list";
import { buildPlansRows } from "@/src/components/plans/plans-rows";
import { trpc } from "@/src/utils/trpc";

export default function PlansScreen() {
	const router = useRouter();
	const utils = trpc.useUtils();
	const { data: trips, isPending, isError } = trpc.trips.list.useQuery();
	const deleteTrip = trpc.trips.delete.useMutation({
		onSuccess: () => {
			void utils.trips.list.invalidate();
		},
	});

	return (
		<>
			<Stack.Screen
				options={{
					title: "Plans",
					headerShown: true,
					headerLargeTitle: true,
					headerTitleStyle: {
						color: Colors.ink.primary,
						fontFamily: "Newsreader",
						fontWeight: "600",
					},
					headerLargeTitleStyle: {
						color: Colors.ink.primary,
						fontFamily: "Newsreader",
						fontWeight: "600",
					},
				}}
			/>
			<Stack.Toolbar placement="right">
				<Stack.Toolbar.Button
					icon="plus"
					onPress={() => router.push("/plans/create")}
				/>
			</Stack.Toolbar>

			{isPending ? (
				<View className="min-h-full flex-1 items-center justify-center bg-surface-canvas py-24">
					<ActivityIndicator color={Colors.accent.orange} />
				</View>
			) : isError ? (
				<View className="min-h-full flex-1 bg-surface-canvas px-4 py-8">
					<Text className="type-body text-ink-secondary">
						Unable to load trips. Pull to refresh when you are back online.
					</Text>
				</View>
			) : (
				<PlansList
					rows={buildPlansRows(trips ?? [])}
					onTripPress={(tripId) => router.push(`/plans/${tripId}`)}
					onTripDelete={(tripId) => deleteTrip.mutate({ tripId })}
					emptyState={<PlansEmptyState />}
				/>
			)}
		</>
	);
}
