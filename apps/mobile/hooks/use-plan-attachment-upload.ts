import { useMutation } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Alert } from "react-native";
import { fetch as nitroFetch } from "react-native-nitro-fetch";
import type {
	PlanAttachment,
	PlanAttachmentKind,
} from "@/src/components/plan-create/types";
import { usePlanCreateWizard } from "@/src/components/plan-create/wizard-context";
import { getApiUrl } from "@/src/utils/api-url";
import { betterAuthCookieHeaders } from "@/src/utils/auth";

function inferAttachmentKind(
	mime: string,
	filename: string,
): PlanAttachmentKind {
	const m = mime.toLowerCase();
	const lower = filename.toLowerCase();
	if (m.includes("pdf") || lower.endsWith(".pdf")) return "pdf";
	if (m.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic)$/i.test(lower)) {
		return "image";
	}
	if (
		m.startsWith("text/") ||
		lower.endsWith(".txt") ||
		lower.endsWith(".md")
	) {
		return "text";
	}
	return "other";
}

type UploadVars = {
	uri: string;
	name: string;
	mime: string;
	kind: PlanAttachmentKind;
};

async function postPlanUpload(vars: UploadVars): Promise<PlanAttachment> {
	const contentType =
		vars.mime.trim().length > 0
			? vars.mime
			: vars.kind === "pdf"
				? "application/pdf"
				: vars.kind === "text"
					? "text/plain"
					: "application/octet-stream";

	const formData = new FormData();
	formData.append("file", {
		uri: vars.uri,
		name: vars.name,
		type: contentType,
	} as unknown as Blob);

	const res = await nitroFetch(`${getApiUrl()}/api/plan-uploads`, {
		method: "POST",
		headers: betterAuthCookieHeaders(),
		body: formData,
	});

	let payload: {
		id?: string;
		name?: string;
		kind?: PlanAttachmentKind;
		error?: string;
	};
	try {
		payload = (await res.json()) as typeof payload;
	} catch {
		throw new Error(`Upload failed (${res.status})`);
	}

	if (!res.ok) {
		throw new Error(payload.error ?? `Upload failed (${res.status})`);
	}
	if (!payload.id || !payload.name || !payload.kind) {
		throw new Error("Invalid upload response");
	}

	return {
		id: payload.id,
		name: payload.name,
		kind: payload.kind,
	};
}

export function usePlanAttachmentUpload() {
	const { setDraft } = usePlanCreateWizard();

	const mutation = useMutation({
		mutationKey: ["plan-upload"],
		mutationFn: postPlanUpload,
		onSuccess: (attachment) => {
			setDraft((prev) => ({
				...prev,
				attachments: [...prev.attachments, attachment],
			}));
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		},
		onError: (e) => {
			Alert.alert(
				"Upload failed",
				e instanceof Error ? e.message : "Could not upload file",
			);
		},
	});

	const pickAndUpload = useCallback(async () => {
		const result = await DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: true,
			type: ["application/pdf", "image/*", "text/plain", "public.plain-text"],
		});

		if (result.canceled) return;
		const asset = result.assets[0];
		if (!asset?.uri) return;

		const mime = asset.mimeType ?? "";
		const displayName = asset.name ?? "Attachment";
		const kind = inferAttachmentKind(mime, displayName);

		mutation.mutate({
			uri: asset.uri,
			name: displayName,
			mime,
			kind,
		});
	}, [mutation]);

	return {
		pickAndUpload,
		isUploading: mutation.isPending,
	};
}
