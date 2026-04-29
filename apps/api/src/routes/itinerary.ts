import { createOpenAI } from "@ai-sdk/openai";
import { createTextStreamResponse, streamText } from "ai";
import { Hono } from "hono";
import { z } from "zod";
import type { ApiEnv } from "../env";

/** Production should validate sessions via getSession(createAuth(c.env), c.req.raw) and return 401 when absent. */
const itineraryStreamBodySchema = z.object({
	tripName: z.string().trim().min(1).max(200),
	notes: z.string().max(50_000).optional(),
	attachments: z
		.array(
			z.object({
				name: z.string().min(1),
				kind: z.enum(["pdf", "image", "other"]).optional(),
			}),
		)
		.optional(),
});

const SYSTEM_PROMPT = `You are an expert travel planner. The user may only provide rough notes and attachment filenames — you do not have the actual file contents.

Write a practical day-by-day trip itinerary in Markdown: use ## Day N headings, bullet activities with approximate timing where helpful, meals/suggestions, and one short "Tips" section at the end. Stay realistic and concise.`;

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

		const attachmentBlock =
			body.attachments?.length ?
				`\nAttachment filenames only (contents not available):\n${body.attachments
					.map((a) => `- ${a.name}${a.kind ? ` (${a.kind})` : ""}`)
					.join("\n")}`
			:	"";

		const prompt = [
			`Trip name: ${body.tripName}`,
			body.notes?.trim() ?
				`\nNotes from the traveler:\n${body.notes.trim()}`
			:	"",
			attachmentBlock,
		].join("\n");

		const openai = createOpenAI({ apiKey });

		const result = streamText({
			model: openai("gpt-4o-mini"),
			system: SYSTEM_PROMPT,
			prompt,
		});

		return createTextStreamResponse({ textStream: result.textStream });
	});

	app.route("/api/itinerary", itinerary);
}
