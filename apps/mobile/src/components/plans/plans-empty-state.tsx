import { Link, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
	Pressable,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { PLAN_CARD_PALETTES } from "@/src/components/plans/plan-card-palettes";

/** Match `rounded-3xl`; clip layer uses same radius so AA blends with hero fill, not white. */
const CARD_RADIUS = 24;
const HEADER_HEIGHT = 96;

/** Placeholder “trips” for the empty-state fan — names + palette order (back → front). */
export const PLANS_EMPTY_PLACEHOLDER_TRIPS = [
	{ key: "somewhere", title: "SOMEWHERE", paletteIndex: 0 },
	{ key: "weekend", title: "A WEEKEND AWAY", paletteIndex: 1 },
	{ key: "long", title: "A LONG ONE", paletteIndex: 2 },
] as const;

const FAN_LAYOUT = [
	{ z: 0, rotate: "-8deg", translateX: -35, translateY: -60, scale: 0.95 },
	{ z: 1, rotate: "6deg", translateX: 35, translateY: -40, scale: 0.97 },
	{ z: 2, rotate: "1deg", translateX: 0, translateY: 0, scale: 1 },
] as const;

function EmptyFanMiniCard({
	title,
	paletteIndex,
	width,
}: {
	title: string;
	paletteIndex: number;
	width: number;
}) {
	const palette = PLAN_CARD_PALETTES[paletteIndex % PLAN_CARD_PALETTES.length];
	return (
		<View
			className="shadow-lg"
			style={{
				width,
				borderRadius: CARD_RADIUS,
				backgroundColor: Colors.surface.card,
			}}
		>
			<View
				style={{
					height: HEADER_HEIGHT,
					borderTopLeftRadius: CARD_RADIUS,
					borderTopRightRadius: CARD_RADIUS,
					overflow: "hidden",
					backgroundColor: palette.bg,
				}}
			>
				<View className="flex-1 px-4 py-2">
					<Text className="type-caption-2 text-ink-tertiary">{title}</Text>
				</View>
			</View>
			<View
				className="border-line-soft border-t px-4 py-3.5"
				style={{
					borderBottomLeftRadius: CARD_RADIUS,
					borderBottomRightRadius: CARD_RADIUS,
					backgroundColor: Colors.surface.card,
				}}
			>
				<View className="mb-2 h-2.5 w-[88%] rounded-full bg-line-soft" />
				<View className="h-2.5 w-[72%] rounded-full bg-line-soft" />
			</View>
		</View>
	);
}

export function PlansEmptyState() {
	const router = useRouter();
	const { width: screenW } = useWindowDimensions();
	const cardWidth = Math.min(300, screenW - 72);

	return (
		<View className="mt-4 pb-8">
			<View className="mb-10 h-[248px] w-full justify-end pb-2">
				{PLANS_EMPTY_PLACEHOLDER_TRIPS.map((trip, i) => {
					const layout = FAN_LAYOUT[i]!;
					return (
						<View
							key={trip.key}
							className="absolute right-0 bottom-2 left-0 items-center"
							style={{ zIndex: layout.z }}
						>
							<View
								style={{
									transform: [
										{ translateX: layout.translateX },
										{ translateY: layout.translateY },
										{ rotate: layout.rotate },
										{ scale: layout.scale },
									],
								}}
							>
								<EmptyFanMiniCard
									paletteIndex={trip.paletteIndex}
									title={trip.title}
									width={cardWidth}
								/>
							</View>
						</View>
					);
				})}
			</View>

			<Text className="type-caption-2 mb-2 text-center text-ink-tertiary uppercase">
				No plans yet
			</Text>
			<Text className="type-title-1 mb-3 text-center font-serif text-ink-primary">
				Where to first?
			</Text>
			<Text className="type-callout mb-8 px-8 text-center font-serif text-ink-secondary">
				Drop in an email, a PDF, or a rough idea and I&apos;ll shape it into a
				plan.
			</Text>

			<Link href="/plans/create" asChild>
				<TouchableOpacity
					activeOpacity={0.8}
					className="mb-4 flex-row items-center justify-center gap-2 rounded-full bg-black py-4"
				>
					<SymbolView name="plus" size={20} tintColor={Colors.ink.inverse} />
					<Text className="type-body text-ink-inverse uppercase">
						Start a plan
					</Text>
				</TouchableOpacity>
			</Link>

			<View className="flex-row flex-wrap items-center justify-center gap-x-0">
				<Text className="type-callout text-ink-secondary">or </Text>
				<Link href="/(authed)/(tabs)/discover" asChild>
					<Pressable
						accessibilityLabel="Browse ideas on Discover"
						accessibilityRole="link"
						hitSlop={8}
					>
						<Text className="type-callout text-ink-secondary underline">
							discover new places
						</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
}
