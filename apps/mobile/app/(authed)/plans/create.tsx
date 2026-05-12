import { useRouter } from "expo-router";
import { View } from "react-native";
import { MultiStepFlow } from "@/src/components/multi-step-flow";
import { PLAN_CREATE_STEP_ID } from "@/src/components/plan-create/flow-ids";
import { PlanCreateShell } from "@/src/components/plan-create/shell";
import { PlanCreateStepCreated } from "@/src/components/plan-create/step-created";
import { PlanCreateStepNewPlan } from "@/src/components/plan-create/step-new-plan";
import { PlanCreateStepReading } from "@/src/components/plan-create/step-reading";
import { PlanCreateStepReview } from "@/src/components/plan-create/step-review";
import { PlanCreateWizardProvider } from "@/src/components/plan-create/wizard-context";

export default function CreatePlanScreen() {
	const router = useRouter();

	return (
		<View className="flex-1" collapsable={false}>
			<PlanCreateWizardProvider>
				<MultiStepFlow initialStep={0} onComplete={() => router.back()}>
					<PlanCreateShell />
					<MultiStepFlow.Step
						stepId={PLAN_CREATE_STEP_ID.newPlan}
						eyebrow="New plan"
					>
						<PlanCreateStepNewPlan />
					</MultiStepFlow.Step>
					<MultiStepFlow.Step
						stepId={PLAN_CREATE_STEP_ID.reading}
						eyebrow="Reading"
					>
						<PlanCreateStepReading />
					</MultiStepFlow.Step>
					<MultiStepFlow.Step
						stepId={PLAN_CREATE_STEP_ID.review}
						eyebrow="Review"
						primaryButtonLabel="Create plan"
					>
						<PlanCreateStepReview />
					</MultiStepFlow.Step>
					<MultiStepFlow.Step
						stepId={PLAN_CREATE_STEP_ID.created}
						eyebrow="Created"
						primaryButtonLabel="Open plan"
					>
						<PlanCreateStepCreated />
					</MultiStepFlow.Step>
				</MultiStepFlow>
			</PlanCreateWizardProvider>
		</View>
	);
}
