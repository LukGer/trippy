import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useLoop } from "../hooks/useLoop";

const STROKE_WIDTH = 5;

export function Spinner({ size }: { size: number }) {
	const loop = useLoop(600);

	const transform = useDerivedValue(() => {
		return [{ rotate: loop.value * 2 * Math.PI }];
	});

	const firstPath = Skia.Path.Make();
	firstPath.addArc(
		{
			x: STROKE_WIDTH / 2,
			y: STROKE_WIDTH / 2,
			height: size - STROKE_WIDTH,
			width: size - STROKE_WIDTH,
		},
		0,
		360,
	);

	const secondPath = Skia.Path.Make();
	secondPath.addArc(
		{
			x: STROKE_WIDTH / 2,
			y: STROKE_WIDTH / 2,
			height: size - STROKE_WIDTH,
			width: size - STROKE_WIDTH,
		},
		180,
		90,
	);

	return (
		<Canvas style={{ width: size + 1, height: size }}>
			<Group transform={transform} origin={{ x: size / 2, y: size / 2 }}>
				<Path
					path={firstPath}
					style="stroke"
					strokeWidth={STROKE_WIDTH}
					color="#B0DEF9"
				/>

				<Path
					path={secondPath}
					style="stroke"
					strokeWidth={STROKE_WIDTH}
					strokeCap="round"
					color="#25AAF6"
				/>
			</Group>
		</Canvas>
	);
}
