import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
	FadeInRight,
	FadeOutRight,
	LinearTransition,
} from "react-native-reanimated";
import { Spinner } from "./spinner";

interface LoadingButtonProps {
	onPress: () => void;
	title: string;
	loading: boolean;
}

export const LoadingButton = (props: LoadingButtonProps) => {
	const { onPress, title, loading } = props;

	return (
		<TouchableOpacity onPress={onPress}>
			<Animated.View layout={LinearTransition} style={styles.button}>
				<Animated.Text layout={LinearTransition} style={styles.title}>
					{title}
				</Animated.Text>

				{loading && (
					<Animated.View entering={FadeInRight} exiting={FadeOutRight}>
						<Spinner size={24} color="white" />
					</Animated.View>
				)}
			</Animated.View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 44,
		backgroundColor: "#007AFF",
		paddingHorizontal: 24,
		borderRadius: 999,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	title: {
		color: "white",
		fontWeight: "bold",
	},
});
