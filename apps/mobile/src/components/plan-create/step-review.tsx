import { ScrollView, Text } from "react-native";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

export function PlanCreateStepReview() {
	const { itineraryText } = usePlanCreateWizard();

	return (
		<PlanCreateStepLayout title="Review">
			<Text className="type-body mb-4 font-serif text-ink-secondary">
				Check the itinerary before we save your plan.
			</Text>
			<ScrollView className="max-h-[480px]">
				<Text className="type-body whitespace-pre-wrap font-serif text-ink-primary">
					{itineraryText || "—"}
				</Text>
			</ScrollView>
		</PlanCreateStepLayout>
	);
}
