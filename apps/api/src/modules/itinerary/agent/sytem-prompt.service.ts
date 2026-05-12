import type { ItinerarySystemPromptContext } from "./types";

function workflowSection(ctx: ItinerarySystemPromptContext): string {
	const lines: string[] = [];
	let step = 1;

	if (ctx.hasAttachments) {
		lines.push(
			`${step}. **Attachments:** Your **first** action must be a single call to \`ingestAttachments\` (no arguments). Do not call other tools before it.\n`,
		);
		step++;
	}

	if (ctx.hasCoverTool) {
		const before =
			ctx.hasAttachments ?
				"After `ingestAttachments` completes, "
			:	"Your **first** action must be ";
		lines.push(
			`${step}. **Cover image:** ${before}call \`fetchTripCoverImage\` exactly once with a short geographic query (city, country, or region the trip centers on, e.g. "Barcelona", "Japan Alps"). Use natural place names only — never URLs, attachment file names, or full sentences. Wait for the tool result before emitting the final structured object. If the trip has no identifiable place, call it once with the broadest region you can honestly infer from the title or notes; only skip calling if the inputs contain no location clues at all.\n`,
		);
		step++;
	}

	lines.push(
		`${step}. **Trip title:** Produce \`generatedTripTitle\` — lightly polish or shorten the working title to match the schema without renaming into a different destination or premise than the inputs imply.`,
	);
	step++;
	lines.push(
		`${step}. **Itinerary:** Fill \`days\` and timeline \`items\` per the schema, grounded only in what the traveler provided.`,
	);

	return `Workflow — complete all parts that apply:\n${lines.join("\n")}`;
}

const SOURCES_AND_RULES = `Sources:
- Working trip title and free-text notes (always in the text block).
- Uploaded files are separate inputs (PDFs, images, plain text, etc.). A list maps each file to its opaque attachmentId.

Rules for timeline rows:
- Every row (each entry in a day's \`items\` array) must be grounded in something explicit in those inputs. Do not add generic filler days, placeholder activities, or invented legs not supported by the text or files.
- When a row is grounded primarily in a specific uploaded file, set \`sourceAttachmentId\` to that file's attachmentId exactly as listed. When the row comes only from notes and/or the trip title, set \`sourceAttachmentId\` to an empty string.
- Include a day in \`days\` only when that calendar day has at least one such grounded item. Do not emit days with empty \`items\` or vague rows that only restate the trip title.
- Never invent confirmation numbers, PNRs, or exact prices; if timing is implied but uncertain, use clear estimated wording.

Follow the structured output schema; field descriptions define the timeline UI.`;

function buildContextPreamble(ctx: ItinerarySystemPromptContext): string {
	const lines = [
		`Current date and time (server, ISO 8601): ${ctx.serverNowIso}`,
		ctx.userDisplayName ?
			`Authenticated traveler display name: ${ctx.userDisplayName}`
		:	null,
	];
	return lines.filter(Boolean).join("\n");
}

export function buildItinerarySystemPrompt(
	ctx: ItinerarySystemPromptContext,
): string {
	const preamble = buildContextPreamble(ctx);
	return `${preamble}\n\nYou turn the traveler's supplied material into one structured trip plan (schema output).\n\n${workflowSection(ctx)}\n\n${SOURCES_AND_RULES}`;
}
