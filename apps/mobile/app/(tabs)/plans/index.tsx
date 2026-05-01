import type { Trip } from "@trippy/contracts/trips";
import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PlansEmptyState } from "@/src/components/plans/plans-empty-state";
import { TripPlanCard } from "@/src/components/plans/trip-plan-card";
import { trpc } from "@/src/utils/trpc";

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
	const insets = useSafeAreaInsets();
	const { data: trips, isPending, isError } = trpc.trips.list.useQuery();
	const list = trips ?? [];
	const { upcoming, planning } = partitionTrips(list);
	const total = list.length;

	const firstUpcomingIsFuture =
		Boolean(upcoming[0]?.startsOn) &&
		startOfDay(new Date(upcoming[0]!.startsOn!)).getTime() >=
			startOfDay(new Date()).getTime();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<View className="min-h-full flex-1 bg-surface-canvas">
				<View
					style={{ paddingTop: insets.top + 8 }}
					className={`border-line-soft px-6 pb-3 ${!isPending && !isError ? "border-b" : ""}`}
				>
					<Text className="type-caption-2 mb-1 text-ink-tertiary uppercase tracking-[2px]">
						YOUR TRIPS · {total === 0 ? "00" : total}
					</Text>
					<View className="flex-row items-center justify-between">
						<Text className="type-large-title font-serif-bold text-ink-primary tracking-[-0.6px]">
							Plans
						</Text>
						<Link href="/plans/create" asChild>
							<Pressable
								accessibilityLabel="Create plan"
								accessibilityRole="button"
								className="h-11 w-11 items-center justify-center rounded-full bg-ink-primary active:opacity-80"
								hitSlop={8}
							>
								<SymbolView
									name="plus"
									resizeMode="scaleAspectFit"
									size={22}
									tintColor={Colors.ink.inverse}
									type="monochrome"
								/>
							</Pressable>
						</Link>
					</View>
				</View>

				{isPending ? (
					<View className="flex-1 items-center justify-center py-24">
						<ActivityIndicator color={Colors.accent.orange} />
					</View>
				) : isError ? (
					<View className="flex-1 px-6 py-8">
						<Text className="type-body text-ink-secondary">
							Unable to load trips. Pull to refresh when you are back online.
						</Text>
					</View>
				) : (
					<ScrollView
						contentContainerClassName="grow px-6 pb-28 pt-2"
						contentInsetAdjustmentBehavior="never"
						showsVerticalScrollIndicator={false}
					>
						{total === 0 ? <PlansEmptyState /> : null}

						{upcoming.length > 0 ? (
							<View className="mt-2">
								<SectionHeader count={upcoming.length} title="Upcoming" />
								{upcoming.map((trip, i) => (
									<TripPlanCard
										key={trip.id}
										paletteIndex={i}
										showNextUp={firstUpcomingIsFuture && i === 0}
										trip={trip}
									/>
								))}
							</View>
						) : null}

						{planning.length > 0 ? (
							<View className={upcoming.length > 0 ? "mt-6" : "mt-2"}>
								<SectionHeader count={planning.length} title="Planning" />
								{planning.map((trip, i) => (
									<TripPlanCard
										key={trip.id}
										paletteIndex={i + upcoming.length}
										trip={trip}
									/>
								))}
							</View>
						) : null}
					</ScrollView>
				)}
			</View>
		</>
	);
}
