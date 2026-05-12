import type { Trip } from "@trippy/contracts/trips";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, {
	FadeInDown,
	LinearTransition,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { PlansEmptyState } from "@/src/components/plans/plans-empty-state";
import { SwipeableTripPlanCard } from "@/src/components/plans/swipeable-trip-plan-card";
import { trpc } from "@/src/utils/trpc";

/** Shared spec so a freshly-created card slides in and neighbors reflow in sync. */
const CARD_LAYOUT = LinearTransition.springify().damping(20).stiffness(180);
const CARD_ENTER = FadeInDown.springify().damping(20).stiffness(180);

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function isTripUpcoming(trip: Trip): boolean {
	if (!trip.startsOn) return false;
	const start = startOfDay(new Date(trip.startsOn));
	const today = startOfDay(new Date());
	if (!trip.endsOn) return start.getTime() >= today.getTime();
	const end = startOfDay(new Date(trip.endsOn));
	return end.getTime() >= today.getTime();
}

function partitionTrips(trips: Trip[]) {
	const upcoming: Trip[] = [];
	const planning: Trip[] = [];
	for (const t of trips) {
		if (isTripUpcoming(t)) upcoming.push(t);
		else planning.push(t);
	}
	upcoming.sort((a, b) => {
		const ta = a.startsOn ? new Date(a.startsOn).getTime() : 0;
		const tb = b.startsOn ? new Date(b.startsOn).getTime() : 0;
		return ta - tb;
	});
	planning.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
	return { upcoming, planning };
}

function SectionHeader({ title, count }: { title: string; count: number }) {
	return (
		<View className="mt-2 mb-3 flex-row items-baseline justify-between px-0.5">
			<Text className="type-caption-2 font-medium text-ink-tertiary uppercase tracking-[2px]">
				{title}
			</Text>
			<Text className="type-caption-2 text-ink-tertiary tabular-nums">
				{String(count).padStart(2, "0")}
			</Text>
		</View>
	);
}

export default function PlansScreen() {
	const router = useRouter();
	const utils = trpc.useUtils();
	const { data: trips, isPending, isError } = trpc.trips.list.useQuery();
	const deleteTrip = trpc.trips.delete.useMutation({
		onSuccess: () => {
			void utils.trips.list.invalidate();
		},
	});
	const list = trips ?? [];
	const { upcoming, planning } = partitionTrips(list);
	const total = list.length;

	const firstUpcomingIsFuture =
		Boolean(upcoming[0]?.startsOn) &&
		startOfDay(new Date(upcoming[0]!.startsOn!)).getTime() >=
			startOfDay(new Date()).getTime();

	return (
		<>
			<Stack.Screen
				options={{
					title: "Plans",
					headerShown: true,
					headerLargeTitle: true,
					headerTitleStyle: { color: Colors.ink.primary, fontFamily: "Newsreader", fontWeight: "600" },
					headerLargeTitleStyle: { color: Colors.ink.primary, fontFamily: "Newsreader", fontWeight: "600" },
				}}
			/>
			<Stack.Toolbar placement="right">
				<Stack.Toolbar.Button
					icon="plus"
					onPress={() => router.push("/plans/create")}
				/>
			</Stack.Toolbar>

			<ScrollView
				className="min-h-full flex-1 bg-surface-canvas"
				contentContainerClassName={`grow px-4 pb-28 pt-2 ${isPending || isError ? "min-h-full" : ""}`}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
			>
				{isPending ? (
					<View className="min-h-[50vh] flex-1 items-center justify-center py-24">
						<ActivityIndicator color={Colors.accent.orange} />
					</View>
				) : isError ? (
					<View className="min-h-[50vh] flex-1 py-8">
						<Text className="type-body text-ink-secondary">
							Unable to load trips. Pull to refresh when you are back online.
						</Text>
					</View>
				) : (
					<>
						<View className="mb-1 border-line-soft border-b pb-3">
							<Text className="type-caption-2 text-ink-tertiary uppercase tracking-[2px]">
								YOUR TRIPS · {total === 0 ? "00" : total}
							</Text>
						</View>

						{total === 0 ? <PlansEmptyState /> : null}

						{upcoming.length > 0 ? (
							<View className="mt-2">
								<SectionHeader count={upcoming.length} title="Upcoming" />
								{upcoming.map((trip, i) => (
									<Animated.View
										key={trip.id}
										entering={CARD_ENTER}
										layout={CARD_LAYOUT}
									>
										<SwipeableTripPlanCard
											paletteIndex={i}
											showNextUp={firstUpcomingIsFuture && i === 0}
											trip={trip}
											onDeleteConfirm={() =>
												deleteTrip.mutate({ tripId: trip.id })
											}
										/>
									</Animated.View>
								))}
							</View>
						) : null}

						{planning.length > 0 ? (
							<View className={upcoming.length > 0 ? "mt-6" : "mt-2"}>
								<SectionHeader count={planning.length} title="Planning" />
								{planning.map((trip, i) => (
									<Animated.View
										key={trip.id}
										entering={CARD_ENTER}
										layout={CARD_LAYOUT}
									>
										<SwipeableTripPlanCard
											paletteIndex={i + upcoming.length}
											trip={trip}
											onDeleteConfirm={() =>
												deleteTrip.mutate({ tripId: trip.id })
											}
										/>
									</Animated.View>
								))}
							</View>
						) : null}
					</>
				)}
			</ScrollView>
		</>
	);
}
