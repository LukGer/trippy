import { DefaultChatTransport, type UIMessage } from "ai";
import { fetch as nitroFetch } from "react-native-nitro-fetch";
import { getApiUrl } from "@/src/utils/api-url";
import { betterAuthCookieHeaders } from "@/src/utils/auth";

/** Shape needed for POST /api/itinerary/stream (matches `PlanDraft` attachment slice). */
export type ItineraryRequestDraft = {
	tripName: string;
	notes: string;
	attachments: { id: string; name: string; kind: string }[];
};

/** Nitro streaming fetch for AI SDK transports (SSE UI message stream body). */
export const nitroStreamingFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => nitroFetch(input, { ...init, stream: true });

/**
 * UI message stream to POST /api/itinerary/stream with the itinerary JSON body (not generic chat messages).
 * `getDraft` is called at request time so the transport stays stable while draft changes.
 */
export function createItineraryChatTransport(
	getDraft: () => ItineraryRequestDraft,
): DefaultChatTransport<UIMessage> {
	return new DefaultChatTransport({
		api: `${getApiUrl()}/api/itinerary/stream`,
		fetch: nitroStreamingFetch,
		prepareSendMessagesRequest: () => {
			const d = getDraft();
			return {
				body: {
					tripName: d.tripName.trim(),
					notes: d.notes.trim() || undefined,
					attachments:
						d.attachments.length > 0 ?
							d.attachments.map(({ id, name, kind }) => ({
								id,
								name,
								kind,
							}))
						:	undefined,
				},
				headers: {
					"Content-Type": "application/json",
					...betterAuthCookieHeaders(),
				},
			};
		},
	});
}
