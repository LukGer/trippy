import type { Trip } from "@trippy/contracts/trips";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { PLAN_CARD_PALETTES } from "@/src/components/plans/plan-card-palettes";

const mono = Platform.select({
	ios: "Menlo",
	android: "monospace",
	default: "monospace",
});

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function daysBetweenInclusive(a: Date, b: Date) {
	const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
	return Math.max(1, Math.round(ms / 86400000) + 1);
}

function formatRange(startsOn: string, endsOn: string | null) {
	const s = new Date(startsOn);
	const e = endsOn ? new Date(endsOn) : s;
	const fmt = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	});
	if (!endsOn || startOfDay(s).getTime() === startOfDay(e).getTime()) {
		return fmt.format(s);
	}
	return `${fmt.format(s)} – ${fmt.format(e)}`;
}

function daysUntilTripStart(startsOn: string) {
	const now = startOfDay(new Date());
	const start = startOfDay(new Date(startsOn));
	const diff = Math.round((start.getTime() - now.getTime()) / 86400000);
	return diff;
}

export type TripPlanCardProps = {
	trip: Trip;
	paletteIndex: number;
	showNextUp?: boolean;
	onPress?: () => void;
};

export function TripPlanCard({
	trip,
	paletteIndex,
	showNextUp,
	onPress,
}: TripPlanCardProps) {
	const palette = PLAN_CARD_PALETTES[paletteIndex % PLAN_CARD_PALETTES.length];
	const hasRange = Boolean(trip.startsOn);
	const daySpan =
		trip.startsOn && trip.endsOn
			? daysBetweenInclusive(new Date(trip.startsOn), new Date(trip.endsOn))
			: trip.startsOn
				? 1
				: null;

	const daysUntil = trip.startsOn ? daysUntilTripStart(trip.startsOn) : null;
	const nextUpLabel =
		showNextUp && daysUntil !== null && daysUntil >= 0
			? daysUntil === 0
				? "NEXT UP · TODAY"
				: `NEXT UP · IN ${daysUntil} DAY${daysUntil === 1 ? "" : "S"}`
			: null;

	const placeParts =
		trip.description
			?.split("·")
			.map((s) => s.trim())
			.filter(Boolean) ?? [];
	const cityCount = placeParts.length;
	const locationsLine = placeParts.join(" · ");

	const metaRight =
		daySpan !== null
			? cityCount >= 2
				? `${daySpan}d · ${cityCount} cities`
				: `${daySpan}d`
			: null;

	const dateLine =
		hasRange && trip.startsOn
			? formatRange(trip.startsOn, trip.endsOn)
			: "Dates to be set";

	return (
		<Pressable
			accessibilityRole="button"
			className="mb-4 overflow-hidden rounded-[22px] active:opacity-92"
			onPress={onPress}
		>
			<View className="bg-surface-card">
				<View className="h-[132px] overflow-hidden">
					<View
						className="absolute inset-0"
						style={{ backgroundColor: palette.bg }}
					/>
					<LinearGradient
						colors={["transparent", palette.stripe, "transparent"]}
						end={{ x: 1, y: 0.35 }}
						locations={[0.2, 0.5, 0.85]}
						start={{ x: 0, y: 0.65 }}
						style={StyleSheet.absoluteFillObject}
					/>
					<LinearGradient
						colors={["rgba(0,0,0,0.04)", "transparent"]}
						end={{ x: 1, y: 1 }}
						start={{ x: 0, y: 0 }}
						style={StyleSheet.absoluteFillObject}
					/>
					<View className="flex-1 justify-between px-4 py-3.5">
						{nextUpLabel ? (
							<Text
								className="text-[11px] text-ink-primary uppercase tracking-[1.2px]"
								style={{ fontFamily: mono }}
							>
								{nextUpLabel}
							</Text>
						) : (
							<View />
						)}
						<View className="flex-row items-end justify-end">
							{metaRight ? (
								<Text
									className="text-[11px] text-ink-primary/75"
									style={{ fontFamily: mono }}
								>
									{metaRight}
								</Text>
							) : null}
						</View>
					</View>
				</View>
				<View className="border-line-soft border-t bg-surface-card px-4 pt-3.5 pb-4">
					<Text
						className="type-title-3 font-serif-bold text-ink-primary"
						numberOfLines={2}
					>
						{trip.name}
					</Text>
					<Text className="type-footnote mt-1.5 text-ink-secondary">
						{dateLine}
					</Text>
					{locationsLine.length > 0 ? (
						<Text className="type-footnote mt-0.5 text-ink-secondary italic">
							{locationsLine}
						</Text>
					) : null}
				</View>
			</View>
		</Pressable>
	);
}
