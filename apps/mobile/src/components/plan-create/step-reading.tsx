import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

export function PlanCreateStepReading() {
	const {
		itineraryText,
		streamStatus,
		streamError,
		startItineraryStream,
		abortItineraryStream,
	} = usePlanCreateWizard();

	useEffect(() => {
		void startItineraryStream();
		return () => abortItineraryStream();
	}, [startItineraryStream, abortItineraryStream]);

	const statusLabel =
		streamStatus === "idle" || streamStatus === "streaming" ?
			streamStatus === "streaming" ?
				"Generating itinerary…"
			:	"Starting…"
		: streamStatus === "error" ?
			"Something went wrong"
		:	null;

	return (
		<PlanCreateStepLayout title="Reading">
			<Text className="type-body mb-4 font-serif text-ink-secondary">
				{"We'll parse what you shared and turn it into structured plans."}
			</Text>
			{statusLabel ?
				<Text className="type-caption-1 mb-2 font-serif text-ink-tertiary">
					{statusLabel}
				</Text>
			:	null}
			{streamError ?
				<Text className="type-body mb-4 font-serif text-red-600">
					{streamError}
				</Text>
			:	null}
			<ScrollView className="max-h-[420px]">
				<Text className="type-body whitespace-pre-wrap font-serif text-ink-primary">
					{itineraryText}
				</Text>
			</ScrollView>
			{streamStatus === "done" ?
				<View className="mt-4">
					<Text className="type-caption-1 font-serif text-ink-tertiary">
						Done — tap Continue to review.
					</Text>
				</View>
			:	null}
		</PlanCreateStepLayout>
	);
}
