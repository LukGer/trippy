import { Hono } from "hono";
import { z } from "zod";
import { createAuth } from "../auth/auth";
import { getSession } from "../auth/auth-context";
import type { ApiEnv } from "../env";
import {
	createItineraryPlanNdjsonStream,
	defaultMediaTypeForAttachmentKind,
} from "../modules/itinerary/agent/itinerary-agent.service";
import type { ItineraryAttachmentPayload } from "../modules/itinerary/agent/types";

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

		const auth = createAuth(c.env);
		const session = await getSession(auth, c.req.raw);
		const userDisplayName =
			session?.user?.name?.trim() || session?.user?.email?.trim() || undefined;

		const attachmentPayloads: ItineraryAttachmentPayload[] = [];

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
				obj.httpMetadata?.contentType?.trim() ||
				defaultMediaTypeForAttachmentKind(a.kind);
			attachmentPayloads.push({
				...a,
				data,
				mediaType,
			});
		}

		const stream = createItineraryPlanNdjsonStream({
			openaiApiKey: apiKey,
			unsplashAccessKey: c.env.UNSPLASH_ACCESS_KEY,
			tripName: body.tripName,
			notes: body.notes,
			attachments: attachmentPayloads,
			userDisplayName,
			parentSignal: c.req.raw.signal,
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
