export type ItineraryAttachmentKind = "pdf" | "image" | "text" | "other";

export type ItineraryAttachmentRef = {
	id: string;
	name: string;
	kind: ItineraryAttachmentKind;
};

export type ItineraryAttachmentPayload = ItineraryAttachmentRef & {
	data: Uint8Array;
	mediaType: string;
};

export type CreateItineraryPlanNdjsonStreamInput = {
	openaiApiKey: string;
	unsplashAccessKey?: string;
	tripName: string;
	notes?: string;
	attachments: ItineraryAttachmentPayload[];
	userDisplayName?: string;
	/** e.g. client disconnect */
	parentSignal?: AbortSignal;
};

export type ItinerarySystemPromptContext = {
	/** ISO 8601 timestamp for grounding relative dates */
	serverNowIso: string;
	/** Optional display name when the request is authenticated */
	userDisplayName?: string;
};

export type FetchTripCoverImageToolOutput =
	| {
			ok: true;
			coverImageUrl: string;
			coverPhotographerName: string;
			coverPhotographerPageUrl: string;
	  }
	| { ok: false; message: string };
