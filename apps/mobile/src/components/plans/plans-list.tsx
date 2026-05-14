import { Button, ContextMenu, Host } from "@expo/ui/swift-ui";
import { LegendList } from "@legendapp/list";
import type { Trip } from "@trippy/contracts/trips";
import { Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import type { PlansRow, PlansRowKind } from "@/src/components/plans/plans-rows";
import { TripPlanCard } from "@/src/components/plans/trip-plan-card";

/** Shared spec so a freshly-created card slides in and neighbors reflow in sync. */
const CARD_LAYOUT = LinearTransition.springify().damping(20).stiffness(180);
const CARD_ENTER = FadeInDown.springify().damping(20).stiffness(180);
const CARD_EXIT = FadeOut.duration(220);
/** Slight delay so the empty state crossfades in after the last card has begun fading out. */
const EMPTY_ENTER = FadeIn.duration(260).delay(140);
const EMPTY_EXIT = FadeOut.duration(180);
const SECTION_ENTER = FadeIn.duration(220);
const SECTION_EXIT = FadeOut.duration(180);

function IntroRow({ total }: { total: number }) {
	return (
		<View className="mb-1 border-line-soft border-b pb-3">
			<Text className="type-caption-2 text-ink-tertiary uppercase tracking-[2px]">
				YOUR TRIPS · {total === 0 ? "00" : String(total).padStart(2, "0")}
			</Text>
		</View>
	);
}

function SectionRow({
	title,
	count,
	topPad,
}: {
	title: string;
	count: number;
	topPad: boolean;
}) {
	return (
		<Animated.View
			entering={SECTION_ENTER}
			exiting={SECTION_EXIT}
			layout={CARD_LAYOUT}
			className={`mb-3 flex-row items-baseline justify-between px-0.5 ${topPad ? "mt-8" : "mt-2"}`}
		>
			<Text className="type-caption-2 font-medium text-ink-tertiary uppercase tracking-[2px]">
				{title}
			</Text>
			<Text className="type-caption-2 text-ink-tertiary tabular-nums">
				{String(count).padStart(2, "0")}
			</Text>
		</Animated.View>
	);
}

function PlanCardRow({
	trip,
	paletteIndex,
	showNextUp,
	onPress,
	onDelete,
}: {
	trip: Trip;
	paletteIndex: number;
	showNextUp: boolean;
	onPress?: () => void;
	onDelete: () => void;
}) {
	return (
		<Animated.View
			entering={CARD_ENTER}
			exiting={CARD_EXIT}
			layout={CARD_LAYOUT}
		>
			<Host matchContents>
				<ContextMenu>
					<ContextMenu.Items>
						<Button
							systemImage="trash"
							label="Delete trip"
							role="destructive"
							onPress={onDelete}
						/>
					</ContextMenu.Items>
					<ContextMenu.Trigger>
						<TripPlanCard
							paletteIndex={paletteIndex}
							showNextUp={showNextUp}
							trip={trip}
							onPress={onPress}
						/>
					</ContextMenu.Trigger>
				</ContextMenu>
			</Host>
		</Animated.View>
	);
}

type Props = {
	rows: PlansRow[];
	onTripPress?: (tripId: string) => void;
	onTripDelete: (tripId: string) => void;
	emptyState: React.ReactNode;
};

/**
 * Trips list. `LegendList` over `ScrollView` for windowed rendering on long lists.
 * `recycleItems={false}` because each card hosts a SwiftUI `ContextMenu` and reanimated
 * layout state — recycling would invalidate both. Per-card enter/exit + the empty-state
 * fade overlap to give a single crossfade when the last card is removed.
 */
export function PlansList({
	rows,
	onTripPress,
	onTripDelete,
	emptyState,
}: Props) {
	return (
		<LegendList<PlansRow>
			data={rows}
			keyExtractor={(item) => item.id}
			getItemType={(item): PlansRowKind => item.kind}
			estimatedItemSize={236}
			recycleItems={false}
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			className="min-h-full flex-1 bg-surface-canvas"
			contentContainerClassName="grow px-4 pb-28 pt-2"
			renderItem={({ item }) => {
				if (item.kind === "intro") {
					return <IntroRow total={item.total} />;
				}
				if (item.kind === "section") {
					return (
						<SectionRow
							title={item.title}
							count={item.count}
							topPad={item.topPad}
						/>
					);
				}
				if (item.kind === "empty") {
					return (
						<Animated.View entering={EMPTY_ENTER} exiting={EMPTY_EXIT}>
							{emptyState}
						</Animated.View>
					);
				}
				return (
					<PlanCardRow
						trip={item.trip}
						paletteIndex={item.paletteIndex}
						showNextUp={item.showNextUp}
						onPress={
							onTripPress ? () => onTripPress(item.trip.id) : undefined
						}
						onDelete={() => onTripDelete(item.trip.id)}
					/>
				);
			}}
		/>
	);
}
