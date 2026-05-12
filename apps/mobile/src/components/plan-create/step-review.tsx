import { Text } from "react-native";
import { ItineraryPlanPreview } from "@/src/components/plan-create/itinerary-plan-preview";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

export function PlanCreateStepReview() {
	const { itineraryPlan, draft } = usePlanCreateWizard();

	return (
		<PlanCreateStepLayout headerLargeTitle={false} title="Review">
			<Text className="type-body mb-4 font-serif text-ink-secondary">
				Check the itinerary before we save your plan.
			</Text>
			<ItineraryPlanPreview
				plan={itineraryPlan}
				attachments={draft.attachments}
			/>
		</PlanCreateStepLayout>
	);
}
