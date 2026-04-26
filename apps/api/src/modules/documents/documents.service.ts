import type { CreateDocumentInput } from "@trippy/contracts/documents";
import { TRPCError } from "@trpc/server";
import type { DocumentsRepo } from "./documents.repo";

export type DocumentsService = ReturnType<typeof createDocumentsService>;

export function createDocumentsService(deps: {
	documentsRepo: DocumentsRepo;
	createId?: () => string;
}) {
	const createId = deps.createId ?? crypto.randomUUID;

	return {
		listForTrip(input: { tripId: string; userId: string }) {
			return deps.documentsRepo.listForOwnedTrip({
				tripId: input.tripId,
				ownerId: input.userId,
			});
		},

		async create(input: CreateDocumentInput & { userId: string }) {
			const document = await deps.documentsRepo.createForOwnedTrip({
				id: createId(),
				tripId: input.tripId,
				ownerId: input.userId,
				title: input.title,
				kind: input.kind,
				fileKey: input.fileKey,
				mimeType: input.mimeType,
				textContent: input.textContent,
				structuredData: input.structuredData,
				sensitive: input.sensitive,
			});

			if (!document) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Trip not found.",
				});
			}

			return document;
		},
	};
}
