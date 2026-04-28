import { Text } from "react-native";
import {
	PlanCreateStepLayout,
	planCreateStepStyles,
} from "@/src/components/plan-create/plan-create-step-layout";

export function PlanCreateStepCreated() {
	return (
		<PlanCreateStepLayout title="Created">
			<Text style={planCreateStepStyles.bodyMuted}>
				Your plan is ready. You can open it from Plans anytime.
			</Text>
		</PlanCreateStepLayout>
	);
}
