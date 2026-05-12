import { useEffect } from "react";
import { Text } from "react-native";
import { useMultiStepFlow } from "@/src/components/multi-step-flow";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";

const AUTO_CLOSE_MS = 2400;

export function PlanCreateStepCreated() {
	const { goNext } = useMultiStepFlow();

	useEffect(() => {
		const timer = setTimeout(goNext, AUTO_CLOSE_MS);
		return () => clearTimeout(timer);
	}, [goNext]);

	return (
		<PlanCreateStepLayout title="Created">
			<Text className="type-body font-serif text-ink-secondary">
				Your plan is ready. You can open it from Plans anytime.
			</Text>
		</PlanCreateStepLayout>
	);
}
