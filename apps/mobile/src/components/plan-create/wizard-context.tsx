import type { ItineraryPlanWithCover } from "@trippy/contracts/itinerary";
import {
	createContext,
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { fetch as nitroFetch } from "react-native-nitro-fetch";
import { getApiUrl } from "@/src/utils/api-url";

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

export type StreamStatus = "idle" | "streaming" | "done" | "error";

type PlanCreateWizardContextValue = {
	draft: PlanDraft;
	setDraft: Dispatch<SetStateAction<PlanDraft>>;
	itineraryPlan: ItineraryPlanWithCover | null;
	streamStatus: StreamStatus;
	streamError: string | null;
	startItineraryStream: () => Promise<void>;
	abortItineraryStream: () => void;
	resetStreamState: () => void;
};

const PlanCreateWizardContext =
	createContext<PlanCreateWizardContextValue | null>(null);

const initialDraft = (): PlanDraft => ({
	tripName: "Japan, two weeks",
	notes: "",
	attachments: [],
});

function parseNdjsonChunks(buffer: string): { lines: string[]; rest: string } {
	const lastNl = buffer.lastIndexOf("\n");
	if (lastNl === -1) return { lines: [], rest: buffer };
	const complete = buffer.slice(0, lastNl);
	const rest = buffer.slice(lastNl + 1);
	const lines = complete.split("\n").filter((l) => l.trim().length > 0);
	return { lines, rest };
}

/** NDJSON line with only cover fields (from tool result), vs full itinerary partial. */
function isCoverOnlyStreamPatch(v: Record<string, unknown>): boolean {
	return (
		typeof v.coverImageUrl === "string" &&
		!("generatedTripTitle" in v) &&
		!("days" in v)
	);
}

function emptyPlanShell(): ItineraryPlanWithCover {
	return { generatedTripTitle: "", days: [], tips: "" };
}

function applyItineraryStreamLine(
	prev: ItineraryPlanWithCover | null,
	data: Record<string, unknown>,
): ItineraryPlanWithCover {
	if (isCoverOnlyStreamPatch(data)) {
		const base = prev ?? emptyPlanShell();
		return {
			...base,
			coverImageUrl: data.coverImageUrl as string,
			...(typeof data.coverPhotographerName === "string" ?
				{ coverPhotographerName: data.coverPhotographerName }
			:	{}),
			...(typeof data.coverPhotographerPageUrl === "string" ?
				{ coverPhotographerPageUrl: data.coverPhotographerPageUrl }
			:	{}),
		};
	}
	const next = data as ItineraryPlanWithCover;
	/* Schema partials never include cover; keep cover from an earlier tool-result line. */
	if (prev?.coverImageUrl?.trim() && !next.coverImageUrl?.trim()) {
		return {
			...next,
			coverImageUrl: prev.coverImageUrl,
			coverPhotographerName: prev.coverPhotographerName,
			coverPhotographerPageUrl: prev.coverPhotographerPageUrl,
		};
	}
	return next;
}

export function PlanCreateWizardProvider({ children }: PropsWithChildren) {
	const [draft, setDraft] = useState<PlanDraft>(initialDraft);
	const [itineraryPlan, setItineraryPlan] =
		useState<ItineraryPlanWithCover | null>(null);
	const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
	const [streamError, setStreamError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const abortItineraryStream = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	const resetStreamState = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setItineraryPlan(null);
		setStreamStatus("idle");
		setStreamError(null);
	}, []);

	const startItineraryStream = useCallback(async () => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setStreamStatus("streaming");
		setStreamError(null);
		setItineraryPlan(null);

		const url = `${getApiUrl()}/api/itinerary/stream`;
		const body = JSON.stringify({
			tripName: draft.tripName.trim(),
			notes: draft.notes.trim() || undefined,
			attachments:
				draft.attachments.length > 0
					? draft.attachments.map(({ id, name, kind }) => ({ id, name, kind }))
					: undefined,
		});

		try {
			const res = await nitroFetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body,
				signal: controller.signal,
				stream: true,
			});

			if (!res.ok) {
				let message = `Request failed (${res.status})`;
				try {
					const errBody = (await res.json()) as { error?: string };
					if (errBody.error) message = errBody.error;
				} catch {
					// ignore
				}
				throw new Error(message);
			}

			const reader = res.body?.getReader();
			if (!reader) throw new Error("No response body");

			const decoder = new TextDecoder();
			let carry = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (controller.signal.aborted) return;
				carry += decoder.decode(value, { stream: true });
				const { lines, rest } = parseNdjsonChunks(carry);
				carry = rest;
				for (const line of lines) {
					try {
						const data = JSON.parse(line) as Record<string, unknown>;
						setItineraryPlan((prev) => applyItineraryStreamLine(prev, data));
					} catch {
						// skip malformed line chunk
					}
				}
			}

			if (carry.trim()) {
				try {
					const data = JSON.parse(carry) as Record<string, unknown>;
					setItineraryPlan((prev) => applyItineraryStreamLine(prev, data));
				} catch {
					// ignore trailing garbage
				}
			}

			setStreamStatus("done");
		} catch (e) {
			if ((e as Error).name === "AbortError") {
				setStreamStatus("idle");
				return;
			}
			setStreamError(e instanceof Error ? e.message : "Something went wrong");
			setStreamStatus("error");
		}
	}, [draft]);

	const value = useMemo<PlanCreateWizardContextValue>(
		() => ({
			draft,
			setDraft,
			itineraryPlan,
			streamStatus,
			streamError,
			startItineraryStream,
			abortItineraryStream,
			resetStreamState,
		}),
		[
			draft,
			itineraryPlan,
			streamStatus,
			streamError,
			startItineraryStream,
			abortItineraryStream,
			resetStreamState,
		],
	);

	return (
		<PlanCreateWizardContext.Provider value={value}>
			{children}
		</PlanCreateWizardContext.Provider>
	);
}

export function usePlanCreateWizard(): PlanCreateWizardContextValue {
	const ctx = useContext(PlanCreateWizardContext);
	if (!ctx) {
		throw new Error(
			"usePlanCreateWizard must be used within PlanCreateWizardProvider",
		);
	}
	return ctx;
}
