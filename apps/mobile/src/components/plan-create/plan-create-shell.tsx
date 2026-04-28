import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import {
	MultiStepFlow,
	useMultiStepFlow,
} from "@/src/components/multi-step-flow";

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
	const { activeIndex, currentStep, goBack, isLastStep, totalSteps } =
		useMultiStepFlow();
	const isFirstStep = activeIndex === 0;
	/** Last step of a multi-step flow: no Cancel/Back (finish via primary action). Single-step still shows Cancel. */
	const hideTrailingAction = isLastStep && totalSteps > 1;

	return (
		<View style={styles.header}>
			<View style={styles.headerRow}>
				<Text style={styles.eyebrow}>{currentStep?.eyebrow ?? ""}</Text>
				{hideTrailingAction ? null : (
					<Pressable
						accessibilityLabel={isFirstStep ? "Cancel" : "Back"}
						accessibilityRole="button"
						hitSlop={12}
						onPress={() => {
							if (isFirstStep) router.back();
							else goBack();
						}}
					>
						<Text style={styles.headerTrailingAction}>
							{isFirstStep ? "Cancel" : "Back"}
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}

function PlanCreateFooter() {
	const {
		activeIndex,
		currentStep,
		goNext,
		isLastStep,
		totalSteps,
	} = useMultiStepFlow();

	const dotKeys = useMemo(
		() => Array.from({ length: totalSteps }, (_, i) => `plan-dot-${i}`),
		[totalSteps],
	);

	const hideDots = isLastStep && totalSteps > 1;
	const dotsOpacity = useSharedValue(hideDots ? 0 : 1);

	useEffect(() => {
		dotsOpacity.value = withTiming(hideDots ? 0 : 1, { duration: 260 });
	}, [hideDots, dotsOpacity]);

	const dotsRowAnimatedStyle = useAnimatedStyle(() => ({
		opacity: dotsOpacity.value,
		height: interpolate(dotsOpacity.value, [0, 1], [0, 14]),
		/** Replaces footer gap so space collapses when dots are hidden */
		marginBottom: interpolate(dotsOpacity.value, [0, 1], [0, 20]),
		overflow: "hidden",
	}));

	const primaryLabel = currentStep?.primaryButtonLabel ?? "Continue";

	return (
		<View style={styles.footer}>
			<Animated.View
				pointerEvents={hideDots ? "none" : "auto"}
				style={[styles.dots, dotsRowAnimatedStyle]}
			>
				{dotKeys.map((dotKey, stepDotIndex) => (
					<AnimatedDot
						key={dotKey}
						active={stepDotIndex === activeIndex}
					/>
				))}
			</Animated.View>
			<Pressable
				accessibilityLabel={primaryLabel}
				accessibilityRole="button"
				onPress={goNext}
				style={({ pressed }) => [
					styles.continueBtn,
					pressed && styles.continueBtnPressed,
				]}
			>
				<Text style={styles.continueLabel}>{primaryLabel}</Text>
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
	headerTrailingAction: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.regular,
		fontSize: 16,
	},
	footer: {
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
