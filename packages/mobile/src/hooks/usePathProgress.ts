import { Skia, type SkPath } from "@shopify/react-native-skia";
import { type SharedValue, useDerivedValue } from "react-native-reanimated";

export const usePathProgress = (
	path: SkPath,
	progress: SharedValue<number>,
) => {
	const contourMeasureIter = Skia.ContourMeasureIter(path, false, 1);
	const contour = contourMeasureIter.next();

	const totalLength = contour?.length() ?? 0;

	return useDerivedValue(() => {
		const length = totalLength * progress.value;
		const [point] = contour?.getPosTan(length) ?? [Skia.Point(0, 0)];

		return point;
	}, [progress]);
};
