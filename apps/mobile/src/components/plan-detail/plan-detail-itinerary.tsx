import type { TripItineraryDay } from "@trippy/core/trips";
import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { MONO_FONT } from "@/src/components/plan-detail/mono";

type Props = {
	days: TripItineraryDay[];
	dayCountLabel: string;
};

/** Lowercase tags shown above each item — derived from the AI's Title-Case type enum. */
const KIND_LABEL: Record<string, string> = {
	Flight: "FLIGHT",
	Transit: "TRANSIT",
	Stay: "STAY",
	Activity: "ACTIVITY",
	Meal: "FOOD",
	Other: "NOTE",
};

const RAIL_LEFT = 18;

function ItineraryItemRow({
	type,
	title,
	subtitle,
}: {
	type: string;
	title: string;
	subtitle: string;
}) {
	return (
		<View className="flex-row gap-3" style={{ paddingVertical: 6 }}>
			<View
				style={{
					width: RAIL_LEFT * 2,
					alignItems: "center",
					justifyContent: "flex-start",
					paddingTop: 6,
					flexShrink: 0,
				}}
			>
				<View
					style={{
						width: 7,
						height: 7,
						borderRadius: 4,
						backgroundColor: Colors.surface.canvas,
						borderWidth: 1,
						borderColor: Colors.line.hollowNodeBorder,
					}}
				/>
			</View>
			<View className="min-w-0 flex-1">
				<Text
					className="text-ink-tertiary uppercase"
					style={{
						fontFamily: MONO_FONT,
						fontSize: 9,
						letterSpacing: 0.8,
						marginBottom: 2,
					}}
				>
					{KIND_LABEL[type] ?? type.toUpperCase()}
				</Text>
				<Text
					className="text-ink-primary"
					style={{ fontSize: 15, lineHeight: 19, fontWeight: "500", letterSpacing: -0.1 }}
				>
					{title}
				</Text>
				{subtitle.length > 0 ? (
					<Text
						className="mt-0.5 font-serif text-ink-secondary italic"
						style={{ fontSize: 13, lineHeight: 17 }}
					>
						{subtitle}
					</Text>
				) : null}
			</View>
		</View>
	);
}

function ItineraryDaySection({ day, index }: { day: TripItineraryDay; index: number }) {
	const dayIndexLabel = day.dayIndexLabel || `Day ${String(index + 1).padStart(2, "0")}`;
	return (
		<View style={{ position: "relative", paddingTop: 14, paddingBottom: 6, paddingHorizontal: 4 }}>
			{/* Hairline rail — sits below the day label and runs to the bottom of the day section. */}
			<View
				style={{
					position: "absolute",
					left: 4 + RAIL_LEFT,
					top: 54,
					bottom: 12,
					width: 0.5,
					backgroundColor: Colors.line.rail,
				}}
			/>
			<View
				className="flex-row items-baseline justify-between gap-2"
				style={{ paddingHorizontal: 4, paddingBottom: 10 }}
			>
				<Text
					className="font-serif text-ink-primary"
					style={{ fontSize: 18, letterSpacing: -0.2, flexShrink: 1 }}
					numberOfLines={1}
				>
					{day.dateLabel}
					{day.locationLabel ? (
						<Text className="font-serif text-ink-secondary italic">
							{" "}
							· {day.locationLabel}
						</Text>
					) : null}
				</Text>
				<Text
					className="text-ink-tertiary uppercase"
					style={{
						fontFamily: MONO_FONT,
						fontSize: 10,
						letterSpacing: 0.6,
						flexShrink: 0,
					}}
				>
					{dayIndexLabel}
				</Text>
			</View>
			{day.items.map((it, ii) => (
				<ItineraryItemRow
					// biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id once flattened back to days
					key={ii}
					type={it.type}
					title={it.title}
					subtitle={it.subtitle}
				/>
			))}
		</View>
	);
}

/** Hairline-rail itinerary — day label spans full width with no rail point, items pin onto the rail. */
export function PlanDetailItinerary({ days, dayCountLabel }: Props) {
	return (
		<View className="mt-6 border-line-soft border-t pt-4">
			<View className="px-6">
				<Text
					className="text-ink-tertiary uppercase"
					style={{
						fontFamily: MONO_FONT,
						fontSize: 10,
						letterSpacing: 1.2,
					}}
				>
					Itinerary · {dayCountLabel}
				</Text>
			</View>
			{days.length === 0 ? (
				<Text
					className="mt-3 px-6 font-serif text-ink-secondary italic"
					style={{ fontSize: 14 }}
				>
					No itinerary yet. Add one from the create flow.
				</Text>
			) : (
				<View style={{ paddingHorizontal: 20, paddingBottom: 8, marginTop: 6 }}>
					{days.map((day, i) => (
						<ItineraryDaySection
							// biome-ignore lint/suspicious/noArrayIndexKey: server response order is the only stable key here
							key={i}
							day={day}
							index={i}
						/>
					))}
				</View>
			)}
		</View>
	);
}
