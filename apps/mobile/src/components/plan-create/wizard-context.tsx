import { useChat } from "@ai-sdk/react";
import type { ItineraryPlanWithCover } from "@trippy/core/itinerary";
import type { UIMessage } from "ai";
import {
	createContext,
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { createItineraryChatTransport } from "@/src/components/plan-create/itinerary-chat-transport";
import {
	buildPhaseRows,
	extractCoverFromParts,
	mergePlanWithCover,
	type PhaseRow,
	parseItineraryPlanFromMessage,
} from "@/src/components/plan-create/itinerary-stream-parse";
import {
	createStreamingStore,
	type StreamingStore,
} from "@/src/components/plan-create/streaming-store";
import type { PlanDraft, StreamStatus } from "@/src/components/plan-create/types";

type CoverPreview = Pick<
	ItineraryPlanWithCover,
	"coverImageUrl" | "coverPhotographerName" | "coverPhotographerPageUrl"
>;

function lastAssistantMessage(messages: UIMessage[]): UIMessage | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i].role === "assistant") return messages[i];
	}
	return undefined;
}

function arePhaseRowsEqual(a: PhaseRow[], b: PhaseRow[]): boolean {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		const x = a[i];
		const y = b[i];
		if (x.id !== y.id || x.status !== y.status || x.label !== y.label) {
			return false;
		}
	}
	return true;
}

function areCoverPreviewsEqual(
	a: CoverPreview | null,
	b: CoverPreview | null,
): boolean {
	if (a === b) return true;
	if (!a || !b) return false;
	return a.coverImageUrl === b.coverImageUrl;
}

type PlanCreateWizardContextValue = {
	draft: PlanDraft;
	setDraft: Dispatch<SetStateAction<PlanDraft>>;
	itineraryPlan: ItineraryPlanWithCover | null;
	streamStatus: StreamStatus;
	streamError: string | null;
	startItineraryStream: () => Promise<void>;
	abortItineraryStream: () => void;
	resetStreamState: () => void;
	/** Reading step registers navigation for successful `useChat` `onFinish`. */
	setOnStreamSuccess: (fn: (() => void) | null) => void;
	/** Pub/sub stores for stream-derived state — subscribe via the hooks below. */
	streamPhasesStore: StreamingStore<PhaseRow[]>;
	streamCoverPreviewStore: StreamingStore<CoverPreview | null>;
};

const PlanCreateWizardContext =
	createContext<PlanCreateWizardContextValue | null>(null);

const initialDraft = (): PlanDraft => ({
	tripName: "Japan, two weeks",
	notes: "",
	attachments: [],
});

export function PlanCreateWizardProvider({ children }: PropsWithChildren) {
	const [draft, setDraft] = useState<PlanDraft>(initialDraft());
	const draftRef = useRef(draft);
	draftRef.current = draft;

	const [itineraryPlan, setItineraryPlan] =
		useState<ItineraryPlanWithCover | null>(null);
	const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
	const [streamError, setStreamError] = useState<string | null>(null);

	const onStreamSuccessRef = useRef<(() => void) | null>(null);
	const setOnStreamSuccess = useCallback((fn: (() => void) | null) => {
		onStreamSuccessRef.current = fn;
	}, []);

	const streamPhasesStore = useMemo(
		() => createStreamingStore<PhaseRow[]>([], arePhaseRowsEqual),
		[],
	);
	const streamCoverPreviewStore = useMemo(
		() => createStreamingStore<CoverPreview | null>(null, areCoverPreviewsEqual),
		[],
	);

	const transport = useMemo(
		() =>
			createItineraryChatTransport(() => ({
				tripName: draftRef.current.tripName,
				notes: draftRef.current.notes,
				attachments: draftRef.current.attachments,
			})),
		[],
	);

	const { messages, sendMessage, stop, setMessages, clearError } = useChat({
		transport,
		onFinish: ({ message, isAbort, isError }) => {
			if (isAbort) {
				setStreamStatus("idle");
				return;
			}
			if (isError) {
				setStreamStatus("error");
				return;
			}
			const basePlan = parseItineraryPlanFromMessage(message);
			if (!basePlan) {
				setStreamError("Could not parse itinerary from response");
				setStreamStatus("error");
				return;
			}
			const coverMeta = extractCoverFromParts(message.parts);
			setItineraryPlan(mergePlanWithCover(basePlan, coverMeta));
			setStreamStatus("done");
			onStreamSuccessRef.current?.();
		},
		onError: (err) => {
			setStreamError(err.message);
			setStreamStatus("error");
		},
	});

	useEffect(() => {
		const assistant = lastAssistantMessage(messages);
		if (!assistant) {
			streamPhasesStore.set([]);
			streamCoverPreviewStore.set(null);
			return;
		}
		streamPhasesStore.set(buildPhaseRows(assistant.parts));
		const cover = extractCoverFromParts(assistant.parts);
		streamCoverPreviewStore.set(
			cover?.coverImageUrl?.trim() ? cover : null,
		);
	}, [messages, streamPhasesStore, streamCoverPreviewStore]);

	const abortItineraryStream = useCallback(async () => {
		await stop();
	}, [stop]);

	const resetStreamState = useCallback(async () => {
		await stop();
		setMessages([]);
		clearError();
		setItineraryPlan(null);
		setStreamStatus("idle");
		setStreamError(null);
	}, [stop, setMessages, clearError]);

	const startItineraryStream = useCallback(async () => {
		await stop();
		clearError();
		setItineraryPlan(null);
		setStreamError(null);
		setStreamStatus("streaming");
		setMessages([]);
		await sendMessage({ text: " " });
	}, [stop, clearError, sendMessage, setMessages]);

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
			setOnStreamSuccess,
			streamPhasesStore,
			streamCoverPreviewStore,
		}),
		[
			draft,
			itineraryPlan,
			streamStatus,
			streamError,
			startItineraryStream,
			abortItineraryStream,
			resetStreamState,
			setOnStreamSuccess,
			streamPhasesStore,
			streamCoverPreviewStore,
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

/** Subscribes only the calling component to streamed phase rows. */
export function useStreamingPhases(): PhaseRow[] {
	const { streamPhasesStore } = usePlanCreateWizard();
	return useSyncExternalStore(
		streamPhasesStore.subscribe,
		streamPhasesStore.get,
	);
}

/** Subscribes only the calling component to the streamed cover preview. */
export function useStreamingCoverPreview(): CoverPreview | null {
	const { streamCoverPreviewStore } = usePlanCreateWizard();
	return useSyncExternalStore(
		streamCoverPreviewStore.subscribe,
		streamCoverPreviewStore.get,
	);
}
