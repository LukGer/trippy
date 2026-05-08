import { useForm } from "@tanstack/react-form";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { usePlanAttachmentUpload } from "@/hooks/use-plan-attachment-upload";
import {
	LabeledFieldLabel,
	LabeledSingleLineField,
} from "@/src/components/labeled-single-line-field";
import { useMultiStepPrimaryGate } from "@/src/components/multi-step-primary-gate";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";

type NewPlanFormValues = {
	tripName: string;
	notes: string;
};

function ContinueBlockedSync({ blocked }: { blocked: boolean }) {
	const { setContinueDisabled } = useMultiStepPrimaryGate();
	useEffect(() => {
		setContinueDisabled(blocked);
	}, [blocked, setContinueDisabled]);
	return null;
}

export function PlanCreateStepNewPlan() {
	const { draft, setDraft } = usePlanCreateWizard();
	const { pickAndUpload, isUploading } = usePlanAttachmentUpload();

	const form = useForm({
		defaultValues: {
			tripName: draft.tripName,
			notes: draft.notes,
		} satisfies NewPlanFormValues,
	});

	const removeAttachment = useCallback(
		(id: string) => {
			setDraft((prev) => ({
				...prev,
				attachments: prev.attachments.filter((a) => a.id !== id),
			}));
			void Haptics.selectionAsync();
		},
		[setDraft],
	);

	const { attachments } = draft;

	return (
		<>
			<form.Subscribe
				selector={(state) =>
					String(state.values.tripName ?? "").trim().length === 0
				}
			>
				{(blocked) => <ContinueBlockedSync blocked={blocked} />}
			</form.Subscribe>
			<PlanCreateStepLayout title="New Plan">
				<form.Field
					name="tripName"
					validators={{
						onChange: ({ value }) =>
							String(value ?? "").trim().length > 0
								? undefined
								: "Add a trip name",
					}}
				>
					{(field) => (
						<>
							<LabeledSingleLineField
								label="Trip name"
								placeholder="Untitled trip"
								value={field.state.value}
								onChangeText={(text) => {
									field.handleChange(text);
									setDraft((prev) => ({ ...prev, tripName: text }));
								}}
							/>
							{field.state.meta.errors.length > 0 ? (
								<Text className="type-caption-1 -mt-3 mb-6 px-1 font-serif text-red-600">
									{String(field.state.meta.errors[0])}
								</Text>
							) : null}
						</>
					)}
				</form.Field>

				<form.Field name="notes">
					{(field) => (
						<View className="mb-6">
							<LabeledFieldLabel>Notes & details</LabeledFieldLabel>
							<View className="overflow-hidden rounded-[14px] bg-surface-card px-4 pt-3.5 pb-3">
								<TextInput
									multiline
									className="type-body h-[220px] pb-2 font-serif text-ink-primary"
									placeholder="Dates, flights, hotels — paste anything you already know."
									placeholderTextColorClassName="accent-ink-tertiary"
									scrollEnabled
									textAlignVertical="top"
									value={field.state.value}
									onChangeText={(text) => {
										field.handleChange(text);
										setDraft((prev) => ({ ...prev, notes: text }));
									}}
								/>
								<Text className="type-footnote font-serif text-ink-tertiary italic">
									Paste emails, lists, links — anything goes.
								</Text>
							</View>
						</View>
					)}
				</form.Field>

				<View className="mb-2">
					<LabeledFieldLabel>Attachments</LabeledFieldLabel>
					<ScrollView
						horizontal
						contentContainerClassName="flex-row gap-3 py-1"
						keyboardShouldPersistTaps="handled"
						showsHorizontalScrollIndicator={false}
					>
						<Pressable
							accessibilityLabel="Add attachment"
							accessibilityRole="button"
							disabled={isUploading}
							className="h-[152px] w-[148px] justify-end rounded-[14px] bg-ink-primary p-3 active:opacity-[0.92]"
							onPress={() => void pickAndUpload()}
						>
							<View className="absolute top-3 left-3 h-9 w-9 items-center justify-center rounded-lg bg-white/18">
								{isUploading ? (
									<ActivityIndicator color={Colors.ink.inverse} size="small" />
								) : (
									<SymbolView
										name="plus"
										size={18}
										tintColor={Colors.ink.inverse}
									/>
								)}
							</View>
							<Text className="type-subhead mb-1 font-serif-bold text-ink-inverse">
								Add attachment
							</Text>
							<Text className="type-caption-1 font-serif text-white/72 italic">
								PDF, photo, text
							</Text>
						</Pressable>

						{attachments.map((item) => (
							<View
								key={item.id}
								className="h-[152px] w-[148px] rounded-[14px] border border-line-soft bg-surface-card p-3"
							>
								<View className="mb-3 flex-row items-start justify-between">
									<Text className="type-caption-2 overflow-hidden rounded-md bg-surface-timeline-a px-2 py-1 font-semibold text-ink-secondary uppercase">
										{item.kind === "pdf"
											? "PDF"
											: item.kind === "image"
												? "Photo"
												: item.kind === "text"
													? "Text"
													: "File"}
									</Text>
									<Pressable
										accessibilityLabel={`Remove ${item.name}`}
										accessibilityRole="button"
										className="p-1"
										hitSlop={10}
										onPress={() => removeAttachment(item.id)}
									>
										<SymbolView
											name="xmark"
											size={12}
											tintColor={Colors.ink.tertiary}
										/>
									</Pressable>
								</View>
								<Text
									className="type-footnote flex-1 font-serif text-ink-primary"
									numberOfLines={3}
								>
									{item.name}
								</Text>
							</View>
						))}
					</ScrollView>
				</View>
			</PlanCreateStepLayout>
		</>
	);
}
