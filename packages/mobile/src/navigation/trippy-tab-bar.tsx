import { useEffect, useRef, useState } from "react";
import {
	type LayoutChangeEvent,
	type ScrollView,
	Animated,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import type { TrippyTabBarProps } from "./TrippyTabs";

const DISTANCE_BETWEEN_TABS = 16;

export function TrippyTabBar({
	state,
	descriptors,
	navigation,
	position,
}: TrippyTabBarProps) {
	const { width: screenWidth } = useWindowDimensions();
	const [widths, setWidths] = useState<number[]>([]);
	const scrollRef = useRef<ScrollView>(null);
	const transform = [];
	const inputRange = state.routes.map((_, i) => i);

	// keep a ref to easily scroll the tab bar to the focused label
	const outputRangeRef = useRef<number[]>([]);

	const getTranslateX = (
		position: Animated.AnimatedInterpolation<number>,
		routes: never[],
		widths: number[],
	) => {
		const outputRange = routes.reduce((acc, _, i: number) => {
			if (i === 0) return [DISTANCE_BETWEEN_TABS / 2 + widths[0] / 2];
			acc.push(
				acc[i - 1] + widths[i - 1] / 2 + widths[i] / 2 + DISTANCE_BETWEEN_TABS,
			);

			return acc;
		}, [] as number[]);

		outputRangeRef.current = outputRange;

		const translateX = position.interpolate({
			inputRange,
			outputRange,
			extrapolate: "clamp",
		});

		return translateX;
	};

	// compute translateX and scaleX because we cannot animate width directly
	if (state.routes.length > 1 && widths.length === state.routes.length) {
		const translateX = getTranslateX(
			position,
			state.routes as never[],
			widths as number[],
		);
		transform.push({
			translateX,
		});
		const outputRange = inputRange.map((_, i) => widths[i]);
		transform.push({
			scaleX:
				state.routes.length > 1
					? position.interpolate({
							inputRange,
							outputRange,
							extrapolate: "clamp",
						})
					: outputRange[0],
		});
	}

	useEffect(() => {
		if (state.routes.length > 1 && widths.length === state.routes.length) {
			if (state.index === 0) {
				scrollRef.current?.scrollTo({
					x: 0,
				});
			} else {
				// keep the focused label at the center of the screen
				scrollRef.current?.scrollTo({
					x: outputRangeRef.current[state.index] - screenWidth / 2,
				});
			}
		}
	}, [state.index, state.routes.length, widths, screenWidth]);

	const onLayout = (event: LayoutChangeEvent, index: number) => {
		const { width } = event.nativeEvent.layout;
		const newWidths = [...widths];
		newWidths[index] = width - DISTANCE_BETWEEN_TABS;
		setWidths(newWidths);
	};

	const labels = state.routes.map((route, index) => {
		const { options } = descriptors[route.key];

		const isFocused = state.index === index;

		const onPress = () => {
			const event = navigation.emit({
				type: "tabPress",
				target: route.key,
				canPreventDefault: true,
			});

			if (!isFocused && !event.defaultPrevented) {
				// The `merge: true` option makes sure that the params inside the tab screen are preserved
				// eslint-disable-next-line
				// @ts-ignore
				navigation.navigate({ name: route.name, merge: true });
			}
		};

		return (
			<Pressable
				onLayout={(e) => onLayout(e, index)}
				key={route.key}
				style={{
					paddingHorizontal: 20,
					alignItems: "center",
					justifyContent: "center",
					flex: 1,
				}}
				onPress={onPress}
			>
				<Text
					className="font-bold text-xl"
					style={{ color: options.isProFeature ? "purple" : "black" }}
				>
					{options.title}
				</Text>
			</Pressable>
		);
	});

	return (
		<View style={styles.contentContainer}>
			<Animated.ScrollView
				horizontal
				ref={scrollRef}
				showsHorizontalScrollIndicator={false}
				style={styles.container}
			>
				{labels}
				<Animated.View style={[styles.indicator, { transform }]} />
			</Animated.ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		justifyContent: "center",
	},
	buttonContainer: {
		paddingHorizontal: DISTANCE_BETWEEN_TABS / 2,
	},
	container: {
		backgroundColor: "white",
		flexDirection: "row",
		height: 44,
	},
	contentContainer: {
		height: 44,
	},
	indicator: {
		position: "absolute",
		backgroundColor: "black",
		height: 3,
		left: 0,
		right: 0,
		bottom: 0,
		width: 1,
	},
	text: {
		color: "black",
		fontSize: 14,
		textAlign: "center",
	},
});
