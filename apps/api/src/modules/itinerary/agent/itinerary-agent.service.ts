import { createOpenAI } from "@ai-sdk/openai";
import { itineraryPlanSchema } from "@trippy/contracts/itinerary";
import {
	type ModelMessage,
	Output,
	stepCountIs,
	streamText,
	type ToolSet,
	UI_MESSAGE_STREAM_HEADERS,
} from "ai";
import { buildItinerarySystemPrompt } from "./sytem-prompt.service";
import {
	createFetchTripCoverImageTool,
	FETCH_TRIP_COVER_IMAGE_TOOL_NAME,
} from "./tools/cover-image.tool";
import {
	createIngestAttachmentsTool,
	INGEST_ATTACHMENTS_TOOL_NAME,
} from "./tools/ingest-attachments.tool";
import type {
	CreateItineraryPlanStreamInput,
	ItineraryAttachmentRef,
} from "./types";

const itineraryAgentStopWhen = stepCountIs(12);

export function defaultMediaTypeForAttachmentKind(
	kind: ItineraryAttachmentRef["kind"],
): string {
	switch (kind) {
		case "pdf":
			return "application/pdf";
		case "image":
			return "image/jpeg";
		case "text":
			return "text/plain";
		default:
			return "application/octet-stream";
	}
}

export function buildItineraryUserPromptText(params: {
	tripName: string;
	notes?: string;
	attachments: ItineraryAttachmentRef[];
}): string {
	const { tripName, notes, attachments } = params;

	const idLines =
		attachments.length > 0
			? attachments
					.map(
						(a) =>
							`- attachmentId=${a.id} name=${JSON.stringify(a.name)} kind=${a.kind}`,
					)
					.join("\n")
			: "";

	return [
		`Working trip title: ${tripName}`,
		notes?.trim() ? `\nNotes from the traveler:\n${notes.trim()}` : "",
		attachments.length > 0
			? `\nAttachment index (use attachmentId values in item sourceAttachmentId when applicable):\n${idLines}`
			: "",
		"\nReturn one complete itinerary matching the schema.",
	].join("");
}

function createItineraryAgentToolset(
	unsplashAccessKey: string | undefined,
	signal: AbortSignal,
	attachmentRefs: ItineraryAttachmentRef[],
): ToolSet | undefined {
	const tools: ToolSet = {};

	if (attachmentRefs.length > 0) {
		tools[INGEST_ATTACHMENTS_TOOL_NAME] =
			createIngestAttachmentsTool(attachmentRefs);
	}

	if (unsplashAccessKey?.trim()) {
		tools[FETCH_TRIP_COVER_IMAGE_TOOL_NAME] = createFetchTripCoverImageTool(
			unsplashAccessKey,
			signal,
		);
	}

	return Object.keys(tools).length > 0 ? tools : undefined;
}

/**
 * AI SDK UI message stream (SSE). Tool parts drive checklist phases; itinerary JSON is in
 * the assistant text part (client parses after stream completes).
 */
export function createItineraryPlanStreamResponse(
	input: CreateItineraryPlanStreamInput,
): Response {
	const {
		openaiApiKey,
		unsplashAccessKey,
		tripName,
		notes,
		attachments,
		userDisplayName,
		parentSignal,
	} = input;

	const attachmentRefs: ItineraryAttachmentRef[] = attachments.map((a) => ({
		id: a.id,
		name: a.name,
		kind: a.kind,
	}));

	const promptText = buildItineraryUserPromptText({
		tripName,
		notes,
		attachments: attachmentRefs,
	});

	const parts: Array<
		| { type: "text"; text: string }
		| {
				type: "file";
				data: Uint8Array;
				mediaType: string;
				filename?: string;
		  }
	> = [{ type: "text", text: promptText }];

	for (const a of attachments) {
		const mediaType =
			a.mediaType.trim() || defaultMediaTypeForAttachmentKind(a.kind);
		parts.push({
			type: "file",
			data: a.data,
			mediaType,
			filename: a.name,
		});
	}

	const messages: ModelMessage[] = [{ role: "user", content: parts }];

	const openai = createOpenAI({ apiKey: openaiApiKey });

	const ac = new AbortController();
	if (parentSignal) {
		if (parentSignal.aborted) ac.abort();
		else
			parentSignal.addEventListener("abort", () => ac.abort(), { once: true });
	}

	const hasCoverTool = Boolean(unsplashAccessKey?.trim());
	const tools = createItineraryAgentToolset(
		unsplashAccessKey,
		ac.signal,
		attachmentRefs,
	);

	const system = buildItinerarySystemPrompt({
		serverNowIso: new Date().toISOString(),
		userDisplayName,
		hasAttachments: attachmentRefs.length > 0,
		hasCoverTool,
	});

	const result = streamText({
		model: openai("gpt-4o-mini"),
		system,
		messages,
		abortSignal: ac.signal,
		...(tools
			? {
					tools,
					stopWhen: itineraryAgentStopWhen,
				}
			: {}),
		output: Output.object({
			schema: itineraryPlanSchema,
			name: "TrippyItinerary",
			description:
				"Structured multi-day trip plan with timeline rows per day (flight, transit, stay, etc.).",
		}),
	});

	return result.toUIMessageStreamResponse({
		headers: { ...UI_MESSAGE_STREAM_HEADERS },
	});
}
