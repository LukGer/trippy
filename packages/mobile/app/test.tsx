import { MoveAlongPath } from "@/src/components/MoveAlongPath";
import { useLoop } from "@/src/hooks/useLoop";
import { Skia } from "@shopify/react-native-skia";
import { View } from "react-native";

export default function TestPage() {
	const progress = useLoop(3000);

	const path = Skia.Path.Make();
	path.addArc({ x: 0, y: 0, width: 200, height: 200 }, 0, -90);

	return (
		<View style={{ width: 300, height: 300 }}>
			<MoveAlongPath path={path} progress={progress}>
				<View style={{ width: 100, height: 100, backgroundColor: "red" }} />
			</MoveAlongPath>
		</View>
	);
}
