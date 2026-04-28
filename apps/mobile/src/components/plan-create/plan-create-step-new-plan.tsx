import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import {
	LabeledSingleLineField,
	labeledSingleLineFieldLabelStyle,
} from "@/src/components/labeled-single-line-field";
import { PlanCreateStepLayout } from "@/src/components/plan-create/plan-create-step-layout";

export type PlanAttachment = {
	id: string;
	name: string;
	kind: "pdf" | "image" | "other";
};

export function PlanCreateStepNewPlan() {
	const [tripName, setTripName] = useState("Japan, two weeks");
	const [notes, setNotes] = useState("");
	const [attachments, setAttachments] = useState<PlanAttachment[]>([]);

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
		else if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic)$/i.test(lower))
			kind = "image";

		setAttachments((prev) => [
			...prev,
			{
				id: `${Date.now()}-${prev.length}`,
				name: asset.name ?? "Attachment",
				kind,
			},
		]);
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}, []);

	const removeAttachment = useCallback((id: string) => {
		setAttachments((prev) => prev.filter((a) => a.id !== id));
		void Haptics.selectionAsync();
	}, []);

	return (
		<PlanCreateStepLayout title="New Plan">
			<LabeledSingleLineField
				label="Trip name"
				placeholder="Untitled trip"
				value={tripName}
				onChangeText={setTripName}
			/>

			<View style={styles.field}>
				<Text style={labeledSingleLineFieldLabelStyle}>Notes & details</Text>
				<View style={styles.notesShell}>
					<TextInput
						multiline
						scrollEnabled
						value={notes}
						onChangeText={setNotes}
						placeholder={
							"Dates, flights, hotels — paste anything you already know."
						}
						placeholderTextColor={Colors.ink.tertiary}
						style={styles.notesInput}
						textAlignVertical="top"
					/>
					<Text style={styles.notesHint}>
						Paste emails, lists, links — anything goes.
					</Text>
				</View>
			</View>

			<View style={styles.attachmentsSection}>
				<Text style={labeledSingleLineFieldLabelStyle}>Attachments</Text>
				<ScrollView
					horizontal
					contentContainerStyle={styles.attachmentsRow}
					keyboardShouldPersistTaps="handled"
					showsHorizontalScrollIndicator={false}
				>
					<Pressable
						accessibilityLabel="Add attachment"
						accessibilityRole="button"
						onPress={() => void handleAddAttachment()}
						style={({ pressed }) => [
							styles.addAttachmentCard,
							pressed && styles.cardPressed,
						]}
					>
						<View style={styles.addIconBadge}>
							<SymbolView name="plus" size={18} tintColor={Colors.ink.inverse} />
						</View>
						<Text style={styles.addAttachmentTitle}>Add attachment</Text>
						<Text style={styles.addAttachmentSubtitle}>
							PDF, photo, screenshot
						</Text>
					</Pressable>

					{attachments.map((item) => (
						<View key={item.id} style={styles.attachmentCard}>
							<View style={styles.attachmentTop}>
								<Text style={styles.kindBadge}>
									{item.kind === "pdf"
										? "PDF"
										: item.kind === "image"
											? "Photo"
											: "File"}
								</Text>
								<Pressable
									accessibilityLabel={`Remove ${item.name}`}
									accessibilityRole="button"
									hitSlop={10}
									onPress={() => removeAttachment(item.id)}
									style={styles.removeBtn}
								>
									<SymbolView
										name="xmark"
										size={12}
										tintColor={Colors.ink.tertiary}
									/>
								</Pressable>
							</View>
							<Text numberOfLines={3} style={styles.attachmentName}>
								{item.name}
							</Text>
						</View>
					))}
				</ScrollView>
			</View>
		</PlanCreateStepLayout>
	);
}

const CARD_W = 148;
const CARD_H = 152;

const styles = StyleSheet.create({
	field: {
		marginBottom: 24,
	},
	notesShell: {
		backgroundColor: Colors.surface.card,
		borderRadius: 14,
		overflow: "hidden",
		paddingBottom: 12,
		paddingHorizontal: 16,
		paddingTop: 14,
	},
	notesInput: {
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.regular,
		fontSize: 16,
		height: 220,
		lineHeight: 22,
		paddingBottom: 8,
	},
	notesHint: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.regular,
		fontSize: 13,
		fontStyle: "italic",
		lineHeight: 18,
	},
	attachmentsSection: {
		marginBottom: 8,
	},
	attachmentsRow: {
		flexDirection: "row",
		gap: 12,
		paddingVertical: 4,
	},
	addAttachmentCard: {
		backgroundColor: Colors.ink.primary,
		borderRadius: 14,
		height: CARD_H,
		justifyContent: "flex-end",
		padding: 12,
		width: CARD_W,
	},
	cardPressed: {
		opacity: 0.92,
	},
	addIconBadge: {
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.18)",
		borderRadius: 8,
		height: 36,
		justifyContent: "center",
		left: 12,
		position: "absolute",
		top: 12,
		width: 36,
	},
	addAttachmentTitle: {
		color: Colors.ink.inverse,
		fontFamily: Fonts.serif.bold,
		fontSize: 15,
		lineHeight: 20,
		marginBottom: 4,
	},
	addAttachmentSubtitle: {
		color: "rgba(255,255,255,0.72)",
		fontFamily: Fonts.serif.regular,
		fontSize: 12,
		fontStyle: "italic",
		lineHeight: 16,
	},
	attachmentCard: {
		backgroundColor: Colors.surface.card,
		borderColor: Colors.line.softHairline,
		borderRadius: 14,
		borderWidth: StyleSheet.hairlineWidth,
		height: CARD_H,
		padding: 12,
		width: CARD_W,
	},
	attachmentTop: {
		alignItems: "flex-start",
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	kindBadge: {
		backgroundColor: Colors.surface.timelineBandA,
		borderRadius: 6,
		color: Colors.ink.secondary,
		fontSize: 10,
		fontWeight: "600",
		overflow: "hidden",
		paddingHorizontal: 8,
		paddingVertical: 4,
		textTransform: "uppercase",
	},
	removeBtn: {
		padding: 4,
	},
	attachmentName: {
		color: Colors.ink.primary,
		flex: 1,
		fontFamily: Fonts.serif.regular,
		fontSize: 14,
		lineHeight: 18,
	},
});
