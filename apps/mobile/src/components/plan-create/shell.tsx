import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import {
	KeyboardStickyView,
	useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import {
	MultiStepFlow,
	useMultiStepFlow,
} from "@/src/components/multi-step-flow";
import {
	PlanCreateScrollInsetProvider,
	usePlanCreateScrollInset,
} from "@/src/components/plan-create/scroll-inset-context";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

export function PlanCreateShell() {
	const insets = useSafeAreaInsets();
	return (
		<PlanCreateScrollInsetProvider>
			<PlanCreateChrome insets={insets} />
		</PlanCreateScrollInsetProvider>
	);
}

function PlanCreateChrome({
	insets,
}: {
	insets: { top: number; bottom: number };
}) {
	const { onFooterBlockLayout } = usePlanCreateScrollInset();
	const { progress } = useReanimatedKeyboardAnimation();

	const footerChromeStyle = useAnimatedStyle(() => {
		const bottomClosed = insets.bottom + 8;
		const bottomOpen = 8;
		return {
			paddingTop: 8,
			paddingBottom: interpolate(
				progress.value,
				[0, 1],
				[bottomClosed, bottomOpen],
			),
		};
	}, [insets.bottom]);

	return (
		<View
			className="flex-1 bg-surface-canvas"
			style={{ paddingTop: insets.top + 8 }}
		>
			<PlanCreateHeader />
			<View className="relative min-h-0 flex-1">
				<MultiStepFlow.Outlet />
			</View>
			<KeyboardStickyView
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
				}}
			>
				{/* Gradient sits on top edge of footer column (same stack as sticky footer, not the scroll layer) */}
				<View style={{ position: "relative" }}>
					<LinearGradient
						colors={[
							"rgba(250,250,247,0)",
							"rgba(250,250,247,0.45)",
							"rgba(250,250,247,0.92)",
							Colors.surface.canvas,
						]}
						locations={[0, 0.38, 0.78, 1]}
						pointerEvents="none"
						style={{
							position: "absolute",
							left: 0,
							right: 0,
							top: 0,
							bottom: 0,
						}}
					/>
					<Animated.View
						className="px-6"
						style={footerChromeStyle}
						onLayout={(e) => onFooterBlockLayout(e.nativeEvent.layout.height)}
					>
						<PlanCreateFooter />
					</Animated.View>
				</View>
			</KeyboardStickyView>
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
		<View className="gap-2 px-6 pb-5">
			<View className="flex-row items-center justify-between">
				<Text className="type-caption-2 font-serif-semibold text-ink-tertiary uppercase tracking-[1.4px]">
					{currentStep?.eyebrow ?? ""}
				</Text>
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
						<Text className="type-body font-serif text-ink-tertiary">
							{isFirstStep ? "Cancel" : "Back"}
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}

function PlanCreateFooter() {
	const { activeIndex, currentStep, goNext, isLastStep, totalSteps } =
		useMultiStepFlow();
	const { streamStatus } = usePlanCreateWizard();

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
		/** Tight gap to primary button; collapses when dots hidden */
		marginBottom: interpolate(dotsOpacity.value, [0, 1], [0, 6]),
		overflow: "hidden",
	}));

	const primaryLabel = currentStep?.primaryButtonLabel ?? "Continue";

	const readingContinueBlocked =
		currentStep?.eyebrow === "Reading" &&
		(streamStatus === "idle" || streamStatus === "streaming");

	return (
		<>
			<Animated.View
				className="flex-row items-center justify-center gap-2"
				pointerEvents={hideDots ? "none" : "auto"}
				style={dotsRowAnimatedStyle}
			>
				{dotKeys.map((dotKey, stepDotIndex) => (
					<AnimatedDot key={dotKey} active={stepDotIndex === activeIndex} />
				))}
			</Animated.View>
			<Pressable
				accessibilityLabel={primaryLabel}
				accessibilityRole="button"
				accessibilityState={{ disabled: readingContinueBlocked }}
				disabled={readingContinueBlocked}
				className={`items-center justify-center rounded-full py-4 active:opacity-[0.88] ${readingContinueBlocked ? "bg-ink-primary/45" : "bg-ink-primary"}`}
				onPress={goNext}
			>
				<Text className="type-headline text-ink-inverse">{primaryLabel}</Text>
			</Pressable>
		</>
	);
}

function AnimatedDot({ active }: { active: boolean }) {
	const style = useAnimatedStyle(() => ({
		width: withTiming(active ? 28 : 6, { duration: 300 }),
		backgroundColor: withTiming(
			active ? Colors.ink.primary : "rgba(0,0,0,0.2)",
			{ duration: 300 },
		),
	}));

	return (
		<Animated.View className="h-1.5 min-h-[6px] rounded-full" style={style} />
	);
}
