import { SymbolView } from "expo-symbols";
import Animated, {
	LinearTransition,
	useDerivedValue,
	withTiming,
} from "react-native-reanimated";
import { Spinner } from "./spinner";

interface StateIndicatorProps {
	state: "loading" | "error" | "success";
	size: "large" | "small";
}

export function StateIndicator(props: StateIndicatorProps) {
	const size = {
		large: 28,
		small: 20,
	}[props.size];

	const { state } = props;

	const text = {
		loading: "Analyzing Transaction",
		error: "Transaction Warning",
		success: "Transaction Safe",
	}[state];

	const fgColor = useDerivedValue(() => {
		return withTiming(
			{
				loading: "#25AAF6",
				error: "#FF003E",
				success: "#43C479",
			}[state],
		);
	});

	const bgColor = useDerivedValue(() => {
		return withTiming(
			{
				loading: "#DDF1FF",
				error: "#FFE2DE",
				success: "#DAF4E2",
			}[state],
		);
	});

	return (
		<Animated.View
			style={{
				backgroundColor: bgColor,
				padding: 8,
				borderRadius: 999,
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "row",
				gap: 8,
			}}
		>
			{state === "loading" ? (
				<Animated.View layout={LinearTransition}>
					<Spinner size={size} />
				</Animated.View>
			) : state === "error" ? (
				<Animated.View layout={LinearTransition}>
					<SymbolView
						name="exclamationmark.triangle.fill"
						size={size}
						resizeMode="scaleAspectFit"
						tintColor="#FF003E"
					/>
				</Animated.View>
			) : (
				<Animated.View layout={LinearTransition}>
					<SymbolView
						name="checkmark.circle.fill"
						size={size}
						resizeMode="scaleAspectFit"
						tintColor="#43C479"
					/>
				</Animated.View>
			)}
			<Animated.Text
				layout={LinearTransition}
				style={{ color: fgColor, fontWeight: "bold" }}
			>
				{text}
			</Animated.Text>
		</Animated.View>
	);
}
