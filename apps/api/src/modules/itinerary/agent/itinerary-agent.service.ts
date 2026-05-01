import { createOpenAI } from "@ai-sdk/openai";
import { itineraryPlanSchema } from "@trippy/contracts/itinerary";
import { type ModelMessage, Output, stepCountIs, streamText } from "ai";
import { buildItinerarySystemPrompt } from "./sytem-prompt.service";
import {
	createFetchTripCoverImageTool,
	FETCH_TRIP_COVER_IMAGE_TOOL_NAME,
} from "./tools/cover-image.tool";
import type {
	CreateItineraryPlanNdjsonStreamInput,
	FetchTripCoverImageToolOutput,
	ItineraryAttachmentRef,
} from "./types";

export type {
	CreateItineraryPlanNdjsonStreamInput,
	FetchTripCoverImageToolOutput,
	ItineraryAttachmentPayload,
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
) {
	if (!unsplashAccessKey) return undefined;
	return {
		[FETCH_TRIP_COVER_IMAGE_TOOL_NAME]: createFetchTripCoverImageTool(
			unsplashAccessKey,
			signal,
		),
	};
}

/**
 * NDJSON stream: optional early cover line(s), then partial itinerary objects.
 */
export function createItineraryPlanNdjsonStream(
	input: CreateItineraryPlanNdjsonStreamInput,
): ReadableStream<Uint8Array> {
	const {
		openaiApiKey,
		unsplashAccessKey,
		tripName,
		notes,
		attachments,
		userDisplayName,
		parentSignal,
	} = input;

	const promptText = buildItineraryUserPromptText({
		tripName,
		notes,
		attachments,
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
	const forwardAbort = () => ac.abort();
	if (parentSignal) {
		if (parentSignal.aborted) forwardAbort();
		else parentSignal.addEventListener("abort", forwardAbort, { once: true });
	}

	const encoder = new TextEncoder();
	const tools = createItineraryAgentToolset(unsplashAccessKey, ac.signal);

	const system = buildItinerarySystemPrompt({
		serverNowIso: new Date().toISOString(),
		userDisplayName,
	});

	return new ReadableStream({
		async start(controller) {
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
				onChunk: ({ chunk }) => {
					if (!tools) return;
					if (chunk.type !== "tool-result") return;
					if (chunk.toolName !== FETCH_TRIP_COVER_IMAGE_TOOL_NAME) return;
					if (chunk.preliminary) return;
					const out = chunk.output as FetchTripCoverImageToolOutput;
					if (!out.ok) return;
					try {
						controller.enqueue(
							encoder.encode(
								`${JSON.stringify({
									coverImageUrl: out.coverImageUrl,
									coverPhotographerName: out.coverPhotographerName,
									coverPhotographerPageUrl: out.coverPhotographerPageUrl,
								})}\n`,
							),
						);
					} catch {
						// controller may be closed
					}
				},
			});

			try {
				for await (const partial of result.partialOutputStream) {
					if (partial !== undefined) {
						controller.enqueue(encoder.encode(`${JSON.stringify(partial)}\n`));
					}
				}
				controller.close();
			} catch (err) {
				controller.error(err);
			} finally {
				parentSignal?.removeEventListener("abort", forwardAbort);
			}
		},
		cancel() {
			ac.abort();
		},
	});
}
