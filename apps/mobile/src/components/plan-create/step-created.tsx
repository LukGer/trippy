import { Text } from "react-native";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";

export function PlanCreateStepCreated() {
	return (
		<PlanCreateStepLayout title="Created">
			<Text className="type-body font-serif text-ink-secondary">
				Your plan is ready. You can open it from Plans anytime.
			</Text>
		</PlanCreateStepLayout>
	);
}
