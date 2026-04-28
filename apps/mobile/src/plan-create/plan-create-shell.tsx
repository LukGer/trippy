import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import {
	MultiStepFlow,
	useMultiStepFlow,
} from "@/src/multi-step-flow/multi-step-flow";

const STEP_DOT_KEYS = ["d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7"] as const;

export function PlanCreateShell() {
	const insets = useSafeAreaInsets();
	return (
		<View
			style={[
				styles.root,
				{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
			]}
		>
			<PlanCreateHeader />
			<View style={styles.body}>
				<MultiStepFlow.Outlet />
			</View>
			<PlanCreateFooter />
		</View>
	);
}

function PlanCreateHeader() {
	const router = useRouter();
	const { currentStep } = useMultiStepFlow();

	return (
		<View style={styles.header}>
			<View style={styles.headerRow}>
				<Text style={styles.eyebrow}>{currentStep?.eyebrow ?? ""}</Text>
				<Pressable
					accessibilityLabel="Cancel"
					accessibilityRole="button"
					hitSlop={12}
					onPress={() => router.back()}
				>
					<Text style={styles.cancel}>Cancel</Text>
				</Pressable>
			</View>
		</View>
	);
}

function PlanCreateFooter() {
	const { activeIndex, goNext, totalSteps } = useMultiStepFlow();

	return (
		<View style={styles.footer}>
			<View style={styles.dots}>
				{STEP_DOT_KEYS.slice(0, totalSteps).map((dotKey, stepDotIndex) => (
					<AnimatedDot key={dotKey} active={stepDotIndex === activeIndex} />
				))}
			</View>
			<Pressable
				accessibilityLabel="Continue"
				accessibilityRole="button"
				onPress={goNext}
				style={({ pressed }) => [
					styles.continueBtn,
					pressed && styles.continueBtnPressed,
				]}
			>
				<Text style={styles.continueLabel}>Continue</Text>
			</Pressable>
		</View>
	);
}

function AnimatedDot({ active }: { active: boolean }) {
	const style = useAnimatedStyle(() => ({
		width: withTiming(active ? 28 : 6, { duration: 300 }),
		backgroundColor: withTiming(active ? Colors.ink.primary : "rgba(0,0,0,0.2)", { duration: 300 }),
	}));

	return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
	root: {
		backgroundColor: Colors.surface.canvas,
		flex: 1,
	},
	body: {
		flex: 1,
		minHeight: 0,
	},
	header: {
		gap: 8,
		paddingBottom: 20,
		paddingHorizontal: 24,
	},
	headerRow: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	eyebrow: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.semibold,
		fontSize: 11,
		letterSpacing: 1.4,
		textTransform: "uppercase",
	},
	cancel: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.regular,
		fontSize: 16,
	},
	footer: {
		gap: 20,
		paddingHorizontal: 24,
		paddingTop: 8,
	},
	dots: {
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
		justifyContent: "center",
	},
	dot: {
		backgroundColor: "rgba(0,0,0,0.2)",
		borderRadius: 999,
		height: 6,
		width: 6,
	},
	dotActive: {
		backgroundColor: Colors.ink.primary,
		borderRadius: 999,
		height: 5,
		width: 28,
	},
	continueBtn: {
		alignItems: "center",
		backgroundColor: Colors.ink.primary,
		borderRadius: 999,
		justifyContent: "center",
		paddingVertical: 16,
	},
	continueBtnPressed: {
		opacity: 0.88,
	},
	continueLabel: {
		color: Colors.ink.inverse,
		fontSize: 17,
		fontWeight: "600",
	},
});
