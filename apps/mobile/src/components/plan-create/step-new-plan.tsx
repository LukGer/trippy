import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/colors";
import {
	LabeledFieldLabel,
	LabeledSingleLineField,
} from "@/src/components/labeled-single-line-field";
import { PlanCreateStepLayout } from "@/src/components/plan-create/step-layout";
import {
	type PlanAttachment,
	usePlanCreateWizard,
} from "@/src/components/plan-create/wizard-context";

export function PlanCreateStepNewPlan() {
	const { draft, setDraft } = usePlanCreateWizard();
	const { tripName, notes, attachments } = draft;

	const handleAddAttachment = useCallback(async () => {
		const result = await DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: true,
			type: ["application/pdf", "image/*"],
		});

		if (result.canceled) return;
		const asset = result.assets[0];
		if (!asset) return;
		const mime = asset.mimeType ?? "";
		const lower = (asset.name ?? "").toLowerCase();
		let kind: PlanAttachment["kind"] = "other";
		if (mime.includes("pdf") || lower.endsWith(".pdf")) kind = "pdf";
		else if (
			mime.startsWith("image/") ||
			/\.(png|jpe?g|gif|webp|heic)$/i.test(lower)
		)
			kind = "image";

		setDraft((prev) => ({
			...prev,
			attachments: [
				...prev.attachments,
				{
					id: `${Date.now()}-${prev.attachments.length}`,
					name: asset.name ?? "Attachment",
					kind,
				},
			],
		}));
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}, [setDraft]);

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

	return (
		<PlanCreateStepLayout title="New Plan">
			<LabeledSingleLineField
				label="Trip name"
				placeholder="Untitled trip"
				value={tripName}
				onChangeText={(text) =>
					setDraft((prev) => ({ ...prev, tripName: text }))
				}
			/>

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
						value={notes}
						onChangeText={(text) =>
							setDraft((prev) => ({ ...prev, notes: text }))
						}
					/>
					<Text className="type-footnote font-serif text-ink-tertiary italic">
						Paste emails, lists, links — anything goes.
					</Text>
				</View>
			</View>

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
						className="h-[152px] w-[148px] justify-end rounded-[14px] bg-ink-primary p-3 active:opacity-[0.92]"
						onPress={() => void handleAddAttachment()}
					>
						<View className="absolute top-3 left-3 h-9 w-9 items-center justify-center rounded-lg bg-white/18">
							<SymbolView
								name="plus"
								size={18}
								tintColor={Colors.ink.inverse}
							/>
						</View>
						<Text className="type-subhead mb-1 font-serif-bold text-ink-inverse">
							Add attachment
						</Text>
						<Text className="type-caption-1 font-serif text-white/72 italic">
							PDF, photo, screenshot
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
	);
}
