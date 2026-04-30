import { Text } from "react-native";
import { ItineraryPlanPreview } from "@/src/components/plan-create/itinerary-plan-preview";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

export function PlanCreateStepReview() {
	const { itineraryPlan, draft } = usePlanCreateWizard();

	return (
		<PlanCreateStepLayout title="Review">
			<Text className="type-body mb-4 font-serif text-ink-secondary">
				Check the itinerary before we save your plan.
			</Text>
			{draft.tripName.trim() ?
				<Text className="type-caption-1 mb-2 font-serif text-ink-tertiary">
					Your working title: <Text className="italic">{draft.tripName}</Text>
				</Text>
			:	null}
			<ItineraryPlanPreview
				plan={itineraryPlan}
				attachments={draft.attachments}
				maxHeightClass="max-h-[480px]"
			/>
		</PlanCreateStepLayout>
	);
}
