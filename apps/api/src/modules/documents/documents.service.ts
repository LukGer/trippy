import type { CreateDocumentInput } from "@trippy/core/documents";
import { TRPCError } from "@trpc/server";
import type { DocumentsRepo } from "./documents.repo";

export class DocumentsService {
	constructor(private readonly documentsRepo: DocumentsRepo) {}

	public listForTrip(input: { tripId: string; userId: string }) {
		return this.documentsRepo.listForOwnedTrip({
			tripId: input.tripId,
			ownerId: input.userId,
		});
	}

	public async create(input: CreateDocumentInput & { userId: string }) {
		const document = await this.documentsRepo.createForOwnedTrip({
			id: crypto.randomUUID(),
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
	}
}
