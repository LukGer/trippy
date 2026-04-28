import { Stack, useRouter } from "expo-router";
import { MultiStepFlow } from "@/src/components/multi-step-flow";
import { PlanCreateShell } from "@/src/components/plan-create/plan-create-shell";
import { PlanCreateStepCreated } from "@/src/components/plan-create/plan-create-step-created";
import { PlanCreateStepNewPlan } from "@/src/components/plan-create/plan-create-step-new-plan";
import { PlanCreateStepReading } from "@/src/components/plan-create/plan-create-step-reading";
import { PlanCreateStepReview } from "@/src/components/plan-create/plan-create-step-review";

export default function CreatePlanScreen() {
	const router = useRouter();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<MultiStepFlow initialStep={0} onComplete={() => router.back()}>
				<PlanCreateShell />
				<MultiStepFlow.Step eyebrow="New plan">
					<PlanCreateStepNewPlan />
				</MultiStepFlow.Step>
				<MultiStepFlow.Step eyebrow="Reading">
					<PlanCreateStepReading />
				</MultiStepFlow.Step>
				<MultiStepFlow.Step eyebrow="Review" primaryButtonLabel="Create plan">
					<PlanCreateStepReview />
				</MultiStepFlow.Step>
				<MultiStepFlow.Step eyebrow="Created" primaryButtonLabel="Open plan">
					<PlanCreateStepCreated />
				</MultiStepFlow.Step>
			</MultiStepFlow>
		</>
	);
}
