import { Skia, type SkPath } from "@shopify/react-native-skia";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

export const MoveAlongPath = ({
	path,
	progress,
	children,
}: {
	path: SkPath;
	progress: SharedValue<number>;
	children: React.ReactNode;
}) => {
	const contourMeasureIter = Skia.ContourMeasureIter(path, false, 1);
	const contour = contourMeasureIter.next();

	const totalLength = contour?.length() ?? 0;

	const parentViewStyle = useAnimatedStyle(() => {
		const length = totalLength * progress.value;
		const [point] = contour?.getPosTan(length) ?? [Skia.Point(0, 0)];

		return {
			transform: [
				{
					translateX: point.x,
				},
				{
					translateY: point.y,
				},
			],
		};
	}, [progress]);

	return (
		<Animated.View
			style={[{ position: "absolute", left: 0, top: 0 }, parentViewStyle]}
		>
			{children}
		</Animated.View>
	);
};
