import { z } from "zod";
import { protectedProcedure, router } from "../../trpc/trpc";
import { createDocumentsRepo } from "./documents.repo";
import { createDocumentInputSchema } from "./documents.schemas";
import { createDocumentsService } from "./documents.service";

const documentsRouterDefinition = {
  list: protectedProcedure
    .input(z.object({ tripId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      const service = createDocumentsService({
        documentsRepo: createDocumentsRepo(ctx.db),
      });

      return service.listForTrip({
        tripId: input.tripId,
        userId: ctx.user.id,
      });
    }),

  create: protectedProcedure
    .input(createDocumentInputSchema)
    .mutation(({ ctx, input }) => {
      const service = createDocumentsService({
        documentsRepo: createDocumentsRepo(ctx.db),
      });

      return service.create({
        ...input,
        userId: ctx.user.id,
      });
    }),
};

type DocumentsRouterDefinition = typeof documentsRouterDefinition;

export const documentsRouter: ReturnType<typeof router<DocumentsRouterDefinition>> =
  router(documentsRouterDefinition);
