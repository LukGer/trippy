import { createOpenAI } from "@ai-sdk/openai";
import { itineraryPlanSchema } from "@trippy/contracts/itinerary";
import {
	type ModelMessage,
	Output,
	stepCountIs,
	streamText,
	tool,
} from "ai";
import { Hono } from "hono";
import { z } from "zod";
import type { ApiEnv } from "../env";
import { fetchUnsplashCoverForQuery } from "../lib/unsplash-cover";

/** Production should validate sessions via getSession(createAuth(c.env), c.req.raw) and return 401 when absent. */
const itineraryStreamBodySchema = z.object({
	tripName: z.string().trim().min(1).max(200),
	notes: z.string().max(50_000).optional(),
	attachments: z
		.array(
			z.object({
				id: z.string().min(1),
				name: z.string().min(1),
				kind: z.enum(["pdf", "image", "text", "other"]),
			}),
		)
		.optional(),
});

const SYSTEM_PROMPT = `You turn the traveler's supplied material into the structured itinerary format only.

Sources:
- Working trip title and free-text notes (always available in the text block).
- Uploaded files appear as separate inputs you can read (PDFs, images, plain text, etc.). A list maps each file to its opaque attachmentId.

Rules:
- Every timeline row (each entry in a day's \`items\` array) must be grounded in something explicit in those inputs. Do not add generic filler days, placeholder activities, or invented legs that are not supported by the text or files.
- When a row is grounded primarily in a specific uploaded file, set \`sourceAttachmentId\` on that row to that file's attachmentId exactly as listed. When the row comes only from notes and/or the trip title, set \`sourceAttachmentId\` to an empty string.
- Include a day in \`days\` only when that calendar day has at least one such grounded item. Do not emit days with empty \`items\` or with vague rows that restate only the trip title.
- \`generatedTripTitle\` may lightly polish or shorten the working title to match the schema; do not rename the trip into a different destination or premise than the inputs imply.
- Never invent confirmation numbers, PNRs, or exact prices; if timing is implied but uncertain, use clear estimated wording.

Follow the structured output schema; field descriptions define the timeline UI.`;

const SYSTEM_PROMPT_WITH_COVER_TOOL = `${SYSTEM_PROMPT}

Cover image (required workflow when the tool is available):
1. Your FIRST action must be a single call to \`fetchTripCoverImage\` with one short place query (city, country, or region the trip centers on, e.g. "Barcelona", "Japan Alps"). Natural geographic names only — never URLs, never file names, never full sentences.
2. Wait for the tool result, then produce the full structured itinerary object in a later step.
3. Do not skip the tool call. The app has no hero image unless you call it.

If the trip has no identifiable place at all, call the tool once with the broadest region you can honestly infer from the title or notes; only skip if inputs are empty of location clues.`;

type FetchTripCoverImageToolOutput =
	| {
			ok: true;
			coverImageUrl: string;
			coverPhotographerName: string;
			coverPhotographerPageUrl: string;
	  }
	| { ok: false; message: string };

function fetchTripCoverImageTool(accessKey: string, signal: AbortSignal) {
	return tool({
		description:
			"REQUIRED first step: fetch one Unsplash hero image for this trip. Call exactly once before you output the itinerary JSON. Argument: short geographic search query only (city, country, or region, e.g. \"Lisbon\", \"Norway\"). Never pass URLs.",
		inputSchema: z.object({
			query: z
				.string()
				.min(1)
				.max(120)
				.describe(
					'Unsplash search query, e.g. "Kyoto", "Scottish Highlands", "Morocco".',
				),
		}),
		execute: async ({ query }): Promise<FetchTripCoverImageToolOutput> => {
			console.info("[fetchTripCoverImage] tool execute", { query });
			const cover = await fetchUnsplashCoverForQuery(accessKey, query, signal);
			if (!cover) {
				console.info("[fetchTripCoverImage] no cover returned");
				return { ok: false, message: "No photo found" };
			}
			return { ok: true, ...cover };
		},
	});
}

function defaultMediaType(kind: "pdf" | "image" | "text" | "other"): string {
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

export function registerItineraryRoutes(app: Hono<ApiEnv>) {
	const itinerary = new Hono<ApiEnv>();

	itinerary.post("/stream", async (c) => {
		const apiKey = c.env.OPENAI_API_KEY;
		if (!apiKey) {
			return c.json(
				{ error: "OPENAI_API_KEY is not configured on the server." },
				503,
			);
		}

		let body: z.infer<typeof itineraryStreamBodySchema>;
		try {
			body = itineraryStreamBodySchema.parse(await c.req.json());
		} catch {
			return c.json({ error: "Invalid request body." }, 400);
		}

		const attachments = body.attachments ?? [];
		const bucket = c.env.PLAN_UPLOADS;

		if (attachments.length > 0 && !bucket) {
			return c.json(
				{ error: "Attachments require R2 (PLAN_UPLOADS) to be configured." },
				503,
			);
		}

		const idLines =
			attachments.length > 0
				? attachments
						.map(
							(a) =>
								`- attachmentId=${a.id} name=${JSON.stringify(a.name)} kind=${a.kind}`,
						)
						.join("\n")
				: "";

		const unsplashKey = c.env.UNSPLASH_ACCESS_KEY;

		const promptText = [
			`Working trip title: ${body.tripName}`,
			body.notes?.trim()
				? `\nNotes from the traveler:\n${body.notes.trim()}`
				: "",
			attachments.length > 0
				? `\nAttachment index (use attachmentId values in item sourceAttachmentId when applicable):\n${idLines}`
				: "",
			unsplashKey
				? "\nBefore the final itinerary: call the fetchTripCoverImage tool once with a short place name for the main destination, then return the full itinerary matching the schema."
				: "",
			"\nReturn one complete itinerary matching the schema.",
		].join("");

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
			const obj = await bucket!.get(a.id);
			if (!obj) {
				return c.json(
					{ error: `Attachment not found or expired: ${a.name}` },
					400,
				);
			}
			const data = new Uint8Array(await obj.arrayBuffer());
			const mediaType =
				obj.httpMetadata?.contentType?.trim() || defaultMediaType(a.kind);
			parts.push({
				type: "file",
				data,
				mediaType,
				filename: a.name,
			});
		}

		const messages: ModelMessage[] = [{ role: "user", content: parts }];

		const openai = createOpenAI({ apiKey });

		const reqSignal = c.req.raw.signal;
		const ac = new AbortController();
		const forwardAbort = () => ac.abort();
		if (reqSignal) {
			if (reqSignal.aborted) forwardAbort();
			else reqSignal.addEventListener("abort", forwardAbort, { once: true });
		}

		const encoder = new TextEncoder();
		const tools = unsplashKey
			? { fetchTripCoverImage: fetchTripCoverImageTool(unsplashKey, ac.signal) }
			: undefined;

		const stream = new ReadableStream({
			async start(controller) {
				const result = streamText({
					model: openai("gpt-4o-mini"),
					system: unsplashKey ? SYSTEM_PROMPT_WITH_COVER_TOOL : SYSTEM_PROMPT,
					messages,
					abortSignal: ac.signal,
					...(tools ?
						{
							tools,
							stopWhen: stepCountIs(12),
						}
					:	{}),
					output: Output.object({
						schema: itineraryPlanSchema,
						name: "TrippyItinerary",
						description:
							"Structured multi-day trip plan with timeline rows per day (flight, transit, stay, etc.).",
					}),
					onChunk: ({ chunk }) => {
						if (!tools) return;
						if (chunk.type !== "tool-result") return;
						if (chunk.toolName !== "fetchTripCoverImage") return;
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
							controller.enqueue(
								encoder.encode(`${JSON.stringify(partial)}\n`),
							);
						}
					}
					controller.close();
				} catch (err) {
					controller.error(err);
				} finally {
					reqSignal?.removeEventListener("abort", forwardAbort);
				}
			},
			cancel() {
				ac.abort();
			},
		});

		return new Response(stream, {
			status: 200,
			headers: {
				"Content-Type": "application/x-ndjson; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	});

	app.route("/api/itinerary", itinerary);
}
