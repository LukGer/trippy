import {
	Canvas,
	Circle,
	Path,
	Skia,
	type Transforms3d,
} from "@shopify/react-native-skia";
import { SymbolView } from "expo-symbols";
import { forwardRef, useEffect } from "react";
import { View } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	type SharedValue,
	useDerivedValue,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

const AnimatedSymbolView = Animated.createAnimatedComponent(
	forwardRef(SymbolView),
);

const STROKE_WIDTH = 3;

interface StateIndicatorProps {
	state: "loading" | "error" | "success";
	size: "large" | "small";
}

export function StateIndicator(props: StateIndicatorProps) {
	const size = {
		large: 40,
		small: 20,
	}[props.size];

	const { state } = props;

	const progress = useSharedValue(0);
	const pathOpacity = useSharedValue(1);
	const circleColor = useSharedValue("#f3f4f6");

	const path = Skia.Path.Make();
	path.moveTo(size / 2, size / 2);
	path.addCircle(size / 2, size / 2, size / 2 - STROKE_WIDTH / 2);

	const transform: SharedValue<Transforms3d> = useDerivedValue(
		() => [{ rotate: progress.value }],
		[progress],
	);

	useEffect(() => {
		progress.value = withRepeat(
			withTiming(2 * Math.PI, {
				duration: 300,
				easing: Easing.linear,
			}),
			-1,
			false,
		);
	});

	useEffect(() => {
		if (state === "loading") {
			pathOpacity.value = withTiming(1, { duration: 150 });
			circleColor.value = withTiming("#e5e7eb", { duration: 150 });
			progress.value = withRepeat(
				withTiming(2 * Math.PI, {
					duration: 600,
					easing: Easing.linear,
				}),
				-1,
				false,
			);
		} else if (state === "success") {
			pathOpacity.value = withTiming(0, { duration: 150 });
			circleColor.value = withTiming("#16a34a", { duration: 150 });
			progress.value = 0;
		} else {
			pathOpacity.value = withTiming(0, { duration: 150 });
			circleColor.value = withTiming("#dc2626", { duration: 150 });
			progress.value = 0;
		}
	}, [state]);

	return (
		<View
			style={{
				width: size,
				height: size,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Canvas style={{ position: "absolute", width: "100%", height: "100%" }}>
				<Circle cx={size / 2} cy={size / 2} r={size / 2} color={circleColor} />
				<Path
					path={path}
					style="stroke"
					strokeWidth={STROKE_WIDTH}
					strokeCap="round"
					color="#6b7280"
					start={0.25}
					end={0.5}
					transform={transform}
					opacity={pathOpacity}
					origin={{ x: size / 2, y: size / 2 }}
				/>
			</Canvas>
			{state === "success" && (
				<AnimatedSymbolView
					entering={FadeIn}
					exiting={FadeOut}
					name="checkmark"
					size={(size / 3) * 2}
					tintColor="white"
					resizeMode="scaleAspectFit"
				/>
			)}

			{state === "error" && (
				<AnimatedSymbolView
					entering={FadeIn}
					exiting={FadeOut}
					name="xmark"
					size={(size / 3) * 2}
					tintColor="white"
					resizeMode="scaleAspectFit"
				/>
			)}
		</View>
	);
}
