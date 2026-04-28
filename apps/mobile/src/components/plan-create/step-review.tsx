import { Text } from "react-native";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";

export function PlanCreateStepReview() {
	return (
		<PlanCreateStepLayout title="Review">
			<Text className="type-body font-serif text-ink-secondary">
				Check the itinerary before we save your plan.
			</Text>
		</PlanCreateStepLayout>
	);
}
