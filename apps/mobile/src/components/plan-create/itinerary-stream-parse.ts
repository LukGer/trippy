import type {
	ItineraryPlan,
	ItineraryPlanWithCover,
} from "@trippy/core/itinerary";
import { itineraryPlanSchema } from "@trippy/core/itinerary";
import type { TextUIPart, UIMessage } from "ai";

export const TOOL_INGEST_ATTACHMENTS = "ingestAttachments" as const;
export const TOOL_FETCH_COVER = "fetchTripCoverImage" as const;

const TOOL_LABELS: Record<string, string> = {
	[TOOL_INGEST_ATTACHMENTS]: "Reading documents",
	[TOOL_FETCH_COVER]: "Searching images",
};

export type PhaseRow = {
	id: string;
	label: string;
	status: "pending" | "active" | "done";
};

const ORDER_LIST: string[] = [
	TOOL_INGEST_ATTACHMENTS,
	TOOL_FETCH_COVER,
	"itinerary",
];
const ORDER_SET = new Set(ORDER_LIST);

function toolRowStatus(
	state: string | undefined,
): "pending" | "active" | "done" {
	if (state === "output-available" || state === "output-error") return "done";
	if (state === "input-streaming" || state === "input-available")
		return "active";
	return "pending";
}

/** Derive checklist rows from the latest assistant message parts. */
export function buildPhaseRows(parts: UIMessage["parts"]): PhaseRow[] {
	const map = new Map<string, PhaseRow>();

	for (const p of parts) {
		if (typeof p.type !== "string" || !p.type.startsWith("tool-")) continue;
		if (!("state" in p)) continue;
		const name = p.type.slice("tool-".length);
		const st = (p as { state?: string }).state;
		map.set(name, {
			id: name,
			label: TOOL_LABELS[name] ?? name,
			status: toolRowStatus(st),
		});
	}

	const textPart = parts.find((x): x is TextUIPart => x.type === "text");
	if (textPart) {
		const t = textPart.state;
		const status =
			t === "streaming"
				? "active"
				: t === "done"
					? "done"
					: textPart.text.length > 0
						? "active"
						: "pending";
		map.set("itinerary", {
			id: "itinerary",
			label: "Constructing itinerary",
			status,
		});
	}

	const out: PhaseRow[] = [];
	for (const id of ORDER_LIST) {
		const row = map.get(id);
		if (row) out.push(row);
	}
	for (const [id, row] of map) {
		if (!ORDER_SET.has(id)) {
			out.push(row);
		}
	}
	return out;
}

type CoverToolOut =
	| {
			ok: true;
			coverImageUrl: string;
			coverPhotographerName: string;
			coverPhotographerPageUrl: string;
	  }
	| { ok: false; message?: string };

export function extractCoverFromParts(
	parts: UIMessage["parts"],
): Pick<
	ItineraryPlanWithCover,
	"coverImageUrl" | "coverPhotographerName" | "coverPhotographerPageUrl"
> | null {
	for (const p of parts) {
		if (p.type !== `tool-${TOOL_FETCH_COVER}`) continue;
		if (!("state" in p) || p.state !== "output-available") continue;
		const out = p.output as CoverToolOut;
		if (!out.ok || !out.coverImageUrl?.trim()) continue;
		return {
			coverImageUrl: out.coverImageUrl,
			coverPhotographerName: out.coverPhotographerName,
			coverPhotographerPageUrl: out.coverPhotographerPageUrl,
		};
	}
	return null;
}

function stripCodeFence(text: string): string {
	const t = text.trim();
	if (!t.startsWith("```")) return t;
	return t
		.replace(/^```(?:json)?\s*\n?/i, "")
		.replace(/\n?```\s*$/i, "")
		.trim();
}

/** Parse final structured plan from completed assistant message (Output.object → text). */
export function parseItineraryPlanFromMessage(
	msg: UIMessage,
): ItineraryPlan | null {
	const textPart = msg.parts.find((x): x is TextUIPart => x.type === "text");
	if (!textPart?.text?.trim()) return null;
	const raw = stripCodeFence(textPart.text);
	try {
		const json = JSON.parse(raw) as unknown;
		const parsed = itineraryPlanSchema.safeParse(json);
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}

export function mergePlanWithCover(
	plan: ItineraryPlan,
	cover: Pick<
		ItineraryPlanWithCover,
		"coverImageUrl" | "coverPhotographerName" | "coverPhotographerPageUrl"
	> | null,
): ItineraryPlanWithCover {
	if (!cover?.coverImageUrl?.trim()) return plan;
	return {
		...plan,
		coverImageUrl: cover.coverImageUrl,
		coverPhotographerName: cover.coverPhotographerName,
		coverPhotographerPageUrl: cover.coverPhotographerPageUrl,
	};
}
