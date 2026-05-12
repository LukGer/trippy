import { useChat } from "@ai-sdk/react";
import type { ItineraryPlanWithCover } from "@trippy/contracts/itinerary";
import type { UIMessage } from "ai";
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
import { createItineraryChatTransport } from "@/src/components/plan-create/itinerary-chat-transport";
import {
	buildPhaseRows,
	extractCoverFromParts,
	mergePlanWithCover,
	type PhaseRow,
	parseItineraryPlanFromMessage,
} from "@/src/components/plan-create/itinerary-stream-parse";
import type { PlanDraft, StreamStatus } from "@/src/components/plan-create/types";

function emptyPlanShell(): ItineraryPlanWithCover {
	return { generatedTripTitle: "", days: [], tips: "" };
}

function lastAssistantMessage(messages: UIMessage[]): UIMessage | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i].role === "assistant") return messages[i];
	}
	return undefined;
}

type PlanCreateWizardContextValue = {
	draft: PlanDraft;
	setDraft: Dispatch<SetStateAction<PlanDraft>>;
	itineraryPlan: ItineraryPlanWithCover | null;
	/** During streaming: cover + empty shell for hero preview only. */
	coverPreviewPlan: ItineraryPlanWithCover | null;
	streamPhases: PhaseRow[];
	streamStatus: StreamStatus;
	streamError: string | null;
	startItineraryStream: () => Promise<void>;
	abortItineraryStream: () => void;
	resetStreamState: () => void;
	/** Reading step registers navigation for successful `useChat` `onFinish`. */
	setOnStreamSuccess: (fn: (() => void) | null) => void;
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

	const assistant = useMemo(() => lastAssistantMessage(messages), [messages]);

	const { streamPhases, coverPreviewPlan } = useMemo(() => {
		if (!assistant) {
			return {
				streamPhases: [] as PhaseRow[],
				coverPreviewPlan: null as ItineraryPlanWithCover | null,
			};
		}
		const phases = buildPhaseRows(assistant.parts);
		const cover = extractCoverFromParts(assistant.parts);
		const coverPreviewPlan =
			cover?.coverImageUrl?.trim() ?
				({ ...emptyPlanShell(), ...cover } satisfies ItineraryPlanWithCover)
			:	null;
		return { streamPhases: phases, coverPreviewPlan };
	}, [assistant]);

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
			coverPreviewPlan,
			streamPhases,
			streamStatus,
			streamError,
			startItineraryStream,
			abortItineraryStream,
			resetStreamState,
			setOnStreamSuccess,
		}),
		[
			draft,
			itineraryPlan,
			coverPreviewPlan,
			streamPhases,
			streamStatus,
			streamError,
			startItineraryStream,
			abortItineraryStream,
			resetStreamState,
			setOnStreamSuccess,
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
