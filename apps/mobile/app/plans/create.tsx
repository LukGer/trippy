import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { MultiStepFlow } from "@/src/multi-step-flow/multi-step-flow";
import { PlanCreateShell } from "@/src/plan-create/plan-create-shell";
import { PlanCreateStepWhere } from "@/src/plan-create/plan-create-step-where";

function PlanCreateStepPlaceholder({
	heading,
	label,
}: {
	heading: string;
	label: string;
}) {
	return (
		<ScrollView
			contentContainerStyle={styles.placeholderContent}
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			style={styles.placeholderScroll}
		>
			<Text style={styles.placeholderHeading}>{heading}</Text>
			<Text style={styles.placeholderText}>{label}</Text>
		</ScrollView>
	);
}

export default function CreatePlanScreen() {
	const router = useRouter();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<MultiStepFlow initialStep={0} onComplete={() => router.back()}>
				<PlanCreateShell />
				<MultiStepFlow.Step eyebrow="New plan">
					<PlanCreateStepWhere />
				</MultiStepFlow.Step>
				<MultiStepFlow.Step eyebrow="New plan">
					<PlanCreateStepPlaceholder
						heading="Add details"
						label="Next step (coming soon)"
					/>
				</MultiStepFlow.Step>
				<MultiStepFlow.Step eyebrow="New plan">
					<PlanCreateStepPlaceholder
						heading="Review"
						label="Review step (coming soon)"
					/>
				</MultiStepFlow.Step>
				<MultiStepFlow.Step eyebrow="New plan">
					<PlanCreateStepPlaceholder
						heading="Finish"
						label="Last step (coming soon)"
					/>
				</MultiStepFlow.Step>
			</MultiStepFlow>
		</>
	);
}

const styles = StyleSheet.create({
	placeholderScroll: {
		flex: 1,
	},
	placeholderContent: {
		flexGrow: 1,
		paddingBottom: 32,
		paddingHorizontal: 24,
		paddingTop: 8,
	},
	placeholderHeading: {
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.bold,
		fontSize: 32,
		letterSpacing: -0.5,
		lineHeight: 38,
		marginBottom: 8,
	},
	placeholderText: {
		color: Colors.ink.secondary,
		fontFamily: Fonts.serif.regular,
		fontSize: 16,
	},
});
