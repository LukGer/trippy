import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import ReanimatedSwipeable, {
	type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
	Extrapolation,
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import {
	TripPlanCard,
	type TripPlanCardProps,
} from "@/src/components/plans/trip-plan-card";

const CIRCLE = 52;
const PAD_END = 14;
const IOS_RED = "#FF3B30";

/** Tap target includes hitSlop padding; fixed rail width so Swipeable doesn’t measure full-row width. */
const HIT = CIRCLE + 8;
const RAIL_WIDTH = PAD_END + HIT + PAD_END;

function useIosCircleStyle(
	progress: SharedValue<number>,
	maxOverscale: number,
) {
	return useAnimatedStyle(() => {
		const p = progress.value;
		const scale = interpolate(
			p,
			[0, 0.12, 0.4, 0.85, 1, 2.2],
			[0.04, 0.42, 0.82, 0.98, 1.04, maxOverscale],
			Extrapolation.CLAMP,
		);
		const opacity = interpolate(p, [0, 0.08], [0, 1], Extrapolation.CLAMP);
		return { transform: [{ scale }], opacity };
	});
}

function TripPlanSwipeRightActions({
	progress,
	methods,
	tripName,
	onDelete,
}: {
	progress: SharedValue<number>;
	methods: SwipeableMethods;
	tripName: string;
	onDelete: () => void;
}) {
	const deleteStyle = useIosCircleStyle(progress, 1.22);

	return (
		<View style={styles.track}>
			<Pressable
				accessibilityLabel="Delete trip"
				accessibilityRole="button"
				hitSlop={8}
				onPress={() => {
					void Haptics.notificationAsync(
						Haptics.NotificationFeedbackType.Warning,
					);
					methods.close();
					Alert.alert(
						"Delete trip",
						`Remove “${tripName}”? This cannot be undone.`,
						[
							{ text: "Cancel", style: "cancel" },
							{
								text: "Delete",
								style: "destructive",
								onPress: onDelete,
							},
						],
					);
				}}
				style={styles.circleHit}
			>
				<Animated.View
					style={[styles.circle, { backgroundColor: IOS_RED }, deleteStyle]}
				>
					<SymbolView name="trash" size={22} tintColor="#FFFFFF" />
				</Animated.View>
			</Pressable>
		</View>
	);
}

export type SwipeableTripPlanCardProps = TripPlanCardProps & {
	onDeleteConfirm: () => void;
};

/**
 * Trip row with [ReanimatedSwipeable](https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable/)
 * — circular actions that scale up with swipe `progress` (extra growth past full open / overshoot signals “will run on release”).
 */
export function SwipeableTripPlanCard({
	trip,
	paletteIndex,
	showNextUp,
	onPress,
	onDeleteConfirm,
}: SwipeableTripPlanCardProps) {
	const renderRightActions = useCallback(
		(
			progress: SharedValue<number>,
			_translation: SharedValue<number>,
			methods: SwipeableMethods,
		) => (
			<TripPlanSwipeRightActions
				methods={methods}
				progress={progress}
				tripName={trip.name}
				onDelete={onDeleteConfirm}
			/>
		),
		[trip.name, onDeleteConfirm],
	);

	return (
		<ReanimatedSwipeable
			childrenContainerStyle={styles.swipeChildren}
			containerStyle={styles.swipeContainer}
			enableTrackpadTwoFingerGesture
			friction={2.2}
			overshootRight={false}
			renderRightActions={renderRightActions}
			rightThreshold={Math.max(28, Math.round(RAIL_WIDTH * 0.38))}
		>
			<TripPlanCard
				paletteIndex={paletteIndex}
				showNextUp={showNextUp}
				trip={trip}
				onPress={onPress}
			/>
		</ReanimatedSwipeable>
	);
}

const styles = StyleSheet.create({
	swipeContainer: {
		marginBottom: 16,
		overflow: "visible",
	},
	swipeChildren: {
		overflow: "visible",
	},
	track: {
		width: RAIL_WIDTH,
		alignSelf: "stretch",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		paddingHorizontal: PAD_END,
		backgroundColor: "transparent",
	},
	circleHit: {
		width: CIRCLE + 8,
		height: CIRCLE + 8,
		alignItems: "center",
		justifyContent: "center",
	},
	circle: {
		width: CIRCLE,
		height: CIRCLE,
		borderRadius: CIRCLE / 2,
		alignItems: "center",
		justifyContent: "center",
	},
});
