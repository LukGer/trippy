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

export type PlanAttachmentKind = "pdf" | "image" | "other";

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
	itineraryText: string;
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

export function PlanCreateWizardProvider({ children }: PropsWithChildren) {
	const [draft, setDraft] = useState<PlanDraft>(initialDraft);
	const [itineraryText, setItineraryText] = useState("");
	const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
	const [streamError, setStreamError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const abortItineraryStream = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	const resetStreamState = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setItineraryText("");
		setStreamStatus("idle");
		setStreamError(null);
	}, []);

	const startItineraryStream = useCallback(async () => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setStreamStatus("streaming");
		setStreamError(null);
		setItineraryText("");

		const url = `${getApiUrl()}/api/itinerary/stream`;
		const body = JSON.stringify({
			tripName: draft.tripName.trim(),
			notes: draft.notes.trim() || undefined,
			attachments:
				draft.attachments.length > 0 ?
					draft.attachments.map(({ name, kind }) => ({ name, kind }))
				:	undefined,
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
			let accumulated = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (controller.signal.aborted) return;
				accumulated += decoder.decode(value, { stream: true });
				setItineraryText(accumulated);
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
			itineraryText,
			streamStatus,
			streamError,
			startItineraryStream,
			abortItineraryStream,
			resetStreamState,
		}),
		[
			draft,
			itineraryText,
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
