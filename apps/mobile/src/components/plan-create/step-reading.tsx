import { useEffect, useRef } from "react";
import { Text } from "react-native";
import { useMultiStepFlow } from "@/src/components/multi-step-flow";
import { PlanCreatePhaseChecklist } from "@/src/components/plan-create/phase-checklist";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

/**
 * One-shot stream when this step mounts. Refs avoid restarting the request if
 * `useChat` identity callbacks change mid-flight (see Vercel rerender-deps guidance).
 * Hero (cover image + title) is rendered by the shell so it persists across the
 * Reading → Review transition.
 */
export function PlanCreateStepReading() {
	const {
		streamPhases,
		streamStatus,
		streamError,
		startItineraryStream,
		abortItineraryStream,
		setOnStreamSuccess,
	} = usePlanCreateWizard();

	const { goNext } = useMultiStepFlow();

	const startRef = useRef(startItineraryStream);
	const abortRef = useRef(abortItineraryStream);
	startRef.current = startItineraryStream;
	abortRef.current = abortItineraryStream;

	useEffect(() => {
		void startRef.current();
		return () => {
			void abortRef.current();
		};
	}, []);

	useEffect(() => {
		setOnStreamSuccess(() => goNext);
		return () => setOnStreamSuccess(null);
	}, [goNext, setOnStreamSuccess]);

	const streamBusy = streamStatus === "streaming" || streamStatus === "idle";

	return (
		<PlanCreateStepLayout headerLargeTitle={false} title="Reading">
			<Text className="type-body mb-4 font-serif text-ink-secondary">
				We&apos;ll parse what you shared and turn it into structured plans.
			</Text>
			<PlanCreatePhaseChecklist rows={streamPhases} streaming={streamBusy} />
			{streamError ? (
				<Text className="type-body mb-4 font-serif text-red-600">
					{streamError}
				</Text>
			) : null}
		</PlanCreateStepLayout>
	);
}
