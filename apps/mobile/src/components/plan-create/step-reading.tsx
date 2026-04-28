import { Text } from "react-native";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";

export function PlanCreateStepReading() {
	return (
		<PlanCreateStepLayout title="Reading">
			<Text className="type-body font-serif text-ink-secondary">
				{"We'll parse what you shared and turn it into structured plans."}
			</Text>
		</PlanCreateStepLayout>
	);
}
