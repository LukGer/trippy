import type { SkPath } from "@shopify/react-native-skia";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import { PathGeometry } from "../utils/PathGeometry";

export const MoveAlongPath = ({
	path,
	progress,
	children,
}: {
	path: SkPath;
	progress: SharedValue<number>;
	children: React.ReactNode;
}) => {
	const points = new PathGeometry(path).getPoints(0.1);

	const parentViewStyle = useAnimatedStyle(() => {
		const index = Math.min(
			Math.floor(progress.value * points.length),
			points.length - 1,
		);
		const point = points[index];

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
