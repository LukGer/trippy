import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
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
	MultiStepPrimaryGateProvider,
	useMultiStepPrimaryGate,
} from "@/src/components/multi-step-primary-gate";
import { PLAN_CREATE_STEP_ID } from "@/src/components/plan-create/flow-ids";
import { PlanCreateHero } from "@/src/components/plan-create/hero";
import {
	PlanCreateScrollInsetProvider,
	usePlanCreateScrollInset,
} from "@/src/components/plan-create/scroll-inset-context";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";
import { trpc } from "@/src/utils/trpc";

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
		<MultiStepPrimaryGateProvider>
			<View className="flex-1 bg-surface-canvas" collapsable={false}>
				<PlanCreateHeaderToolbar />
				<PlanCreateHero />
				<View className="relative min-h-0 flex-1" collapsable={false}>
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
							className="px-4"
							style={footerChromeStyle}
							onLayout={(e) => onFooterBlockLayout(e.nativeEvent.layout.height)}
						>
							<PlanCreateFooter />
						</Animated.View>
					</View>
				</KeyboardStickyView>
			</View>
		</MultiStepPrimaryGateProvider>
	);
}

/** Native toolbar (not headerLeft/headerRight) avoids liquid-glass pill chrome on static labels. */
function PlanCreateHeaderToolbar() {
	const router = useRouter();
	const { activeIndex, goBack, isLastStep, totalSteps } = useMultiStepFlow();
	const isFirstStep = activeIndex === 0;
	const hideTrailingAction = isLastStep && totalSteps > 1;

	const onTrailingPress = () => {
		if (isFirstStep) router.back();
		else goBack();
	};

	return (
		<Stack.Toolbar placement="right">
			<Stack.Toolbar.Button
				hidden={hideTrailingAction}
				variant="plain"
				onPress={onTrailingPress}
			>
				{isFirstStep ? "Cancel" : "Back"}
			</Stack.Toolbar.Button>
		</Stack.Toolbar>
	);
}

function PlanCreateFooter() {
	const { continueDisabled } = useMultiStepPrimaryGate();
	const { activeIndex, currentStep, goNext, isLastStep, totalSteps } =
		useMultiStepFlow();
	const { streamStatus, draft, itineraryPlan } = usePlanCreateWizard();
	const utils = trpc.useUtils();
	const createTrip = trpc.trips.create.useMutation({
		onSuccess: () => {
			void utils.trips.list.invalidate();
		},
	});

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

	const stepId = currentStep?.stepId;
	const readingContinueBlocked =
		stepId === PLAN_CREATE_STEP_ID.reading &&
		(streamStatus === "idle" || streamStatus === "streaming");

	const isReviewStep = stepId === PLAN_CREATE_STEP_ID.review;
	const saveBlocked = isReviewStep && createTrip.isPending;
	const blocked = readingContinueBlocked || saveBlocked || continueDisabled;

	const onPrimaryPress = () => {
		if (isReviewStep) {
			if (!itineraryPlan) return;
			const raw =
				itineraryPlan.generatedTripTitle?.trim() ||
				draft.tripName.trim() ||
				"Untitled trip";
			const name = raw.slice(0, 120);
			const coverUrl = itineraryPlan.coverImageUrl?.trim();
			const planForApi = {
				generatedTripTitle: itineraryPlan.generatedTripTitle,
				startsOnIso: itineraryPlan.startsOnIso,
				endsOnIso: itineraryPlan.endsOnIso,
				tips: itineraryPlan.tips,
				days: itineraryPlan.days,
			};
			void createTrip
				.mutateAsync({
					name,
					startsOnIso: itineraryPlan.startsOnIso,
					endsOnIso: itineraryPlan.endsOnIso,
					coverImageUrl: coverUrl ? coverUrl : undefined,
					coverPhotographerName: coverUrl
						? itineraryPlan.coverPhotographerName?.trim() || undefined
						: undefined,
					coverPhotographerPageUrl: coverUrl
						? itineraryPlan.coverPhotographerPageUrl?.trim() || undefined
						: undefined,
					itineraryPlan: planForApi,
				})
				.then(() => goNext());
			return;
		}
		goNext();
	};

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
			{createTrip.error ? (
				<Text className="type-callout mb-2 px-1 text-center font-serif text-red-600">
					{createTrip.error.message}
				</Text>
			) : null}
			<Pressable
				accessibilityLabel={primaryLabel}
				accessibilityRole="button"
				accessibilityState={{
					disabled: blocked,
				}}
				disabled={blocked}
				className="items-center justify-center rounded-full bg-ink-primary py-4 active:opacity-[0.88] disabled:bg-ink-primary/45"
				onPress={onPrimaryPress}
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
