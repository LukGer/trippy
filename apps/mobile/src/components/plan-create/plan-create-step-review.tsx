import { Text } from "react-native";
import {
	PlanCreateStepLayout,
	planCreateStepStyles,
} from "@/src/components/plan-create/plan-create-step-layout";

export function PlanCreateStepReview() {
	return (
		<PlanCreateStepLayout title="Review">
			<Text style={planCreateStepStyles.bodyMuted}>
				Check the itinerary before we save your plan.
			</Text>
		</PlanCreateStepLayout>
	);
}
