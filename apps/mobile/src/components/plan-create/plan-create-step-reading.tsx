import { Text } from "react-native";
import {
	PlanCreateStepLayout,
	planCreateStepStyles,
} from "@/src/components/plan-create/plan-create-step-layout";

export function PlanCreateStepReading() {
	return (
		<PlanCreateStepLayout title="Reading">
			<Text style={planCreateStepStyles.bodyMuted}>
				{"We'll parse what you shared and turn it into structured plans."}
			</Text>
		</PlanCreateStepLayout>
	);
}
