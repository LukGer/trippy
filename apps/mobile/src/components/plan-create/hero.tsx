import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import { useMultiStepFlow } from "@/src/components/multi-step-flow";
import { PLAN_CREATE_STEP_ID } from "@/src/components/plan-create/flow-ids";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

/** Layout transition reused on hero container, image card, and title so they move in sync. */
const TRANSITION = LinearTransition.springify()
	.damping(18)
	.stiffness(160)
	.mass(0.7);

/**
 * Persistent hero rendered by the wizard shell on Reading + Review.
 * Stays mounted across the step transition so Reanimated `LinearTransition`
 * can animate the cover image and title from a centered hero on Reading
 * into a compact header above the itinerary on Review.
 */
export function PlanCreateHero() {
	const { currentStep } = useMultiStepFlow();
	const { itineraryPlan, coverPreviewPlan, draft } = usePlanCreateWizard();

	const stepId = currentStep?.stepId;
	const isReading = stepId === PLAN_CREATE_STEP_ID.reading;
	const isReview = stepId === PLAN_CREATE_STEP_ID.review;
	if (!isReading && !isReview) return null;

	const coverUrl =
		itineraryPlan?.coverImageUrl?.trim() ||
		coverPreviewPlan?.coverImageUrl?.trim() ||
		null;
	const title =
		itineraryPlan?.generatedTripTitle?.trim() ||
		draft.tripName.trim() ||
		"Your trip";

	return (
		<Animated.View
			entering={FadeIn.duration(220)}
			exiting={FadeOut.duration(160)}
			layout={TRANSITION}
			className={
				isReading
					? "items-center px-6 pt-4 pb-3"
					: "items-center px-4 pt-2 pb-2"
			}
		>
			<Animated.View
				layout={TRANSITION}
				className="overflow-hidden border border-line-soft border-continuous"
				style={
					isReading
						? { width: "100%", aspectRatio: 16 / 9, borderRadius: 22 }
						: { width: 160, aspectRatio: 16 / 9, borderRadius: 14 }
				}
			>
				{coverUrl ? (
					<Image
						source={{ uri: coverUrl }}
						style={{ width: "100%", height: "100%" }}
						contentFit="cover"
						transition={200}
					/>
				) : (
					<View className="h-full w-full bg-surface-card" />
				)}
			</Animated.View>
			<Animated.Text
				layout={TRANSITION}
				numberOfLines={2}
				className={
					isReading
						? "type-title-2 mt-4 text-center font-serif-semibold text-ink-primary"
						: "type-headline mt-2 text-center font-serif-semibold text-ink-primary"
				}
			>
				{title}
			</Animated.Text>
		</Animated.View>
	);
}
