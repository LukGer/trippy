import { tool } from "ai";
import { z } from "zod";
import type { ItineraryAttachmentRef } from "../types";

export const INGEST_ATTACHMENTS_TOOL_NAME = "ingestAttachments" as const;

export type IngestAttachmentsToolOutput = {
	ok: true;
	attachmentCount: number;
	names: string[];
};

/**
 * Orchestration tool: only registered when uploads exist. Files are already in the
 * user message; this call drives the "Reading documents" checklist step.
 */
export function createIngestAttachmentsTool(refs: ItineraryAttachmentRef[]) {
	const summary = refs.map((r) => r.name);
	return tool({
		description:
			"If the traveler uploaded files, call this ONCE first (before fetchTripCoverImage) to confirm you will use attachmentIds from the prompt in itinerary rows.",
		inputSchema: z.object({}),
		execute: async (): Promise<IngestAttachmentsToolOutput> => ({
			ok: true,
			attachmentCount: refs.length,
			names: summary,
		}),
	});
}
