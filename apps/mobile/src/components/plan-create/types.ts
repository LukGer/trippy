export type PlanAttachmentKind = "pdf" | "image" | "text" | "other";

export type PlanAttachment = {
	id: string;
	name: string;
	kind: PlanAttachmentKind;
};

export type PlanDraft = {
	tripName: string;
	notes: string;
	attachments: PlanAttachment[];
};

/** Lifecycle of POST /api/itinerary/stream as seen by the wizard UI */
export type StreamStatus = "idle" | "streaming" | "done" | "error";
