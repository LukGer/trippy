import { z } from "zod";
import { protectedProcedure, router } from "../../trpc/trpc";
import { createDocumentInputSchema } from "./documents.schemas";

const documentsRouterDefinition = {
  list: protectedProcedure
    .input(z.object({ tripId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.services.documents.listForTrip({
        tripId: input.tripId,
        userId: ctx.user.id,
      });
    }),

  create: protectedProcedure
    .input(createDocumentInputSchema)
    .mutation(({ ctx, input }) => {
      return ctx.services.documents.create({
        ...input,
        userId: ctx.user.id,
      });
    }),
};

type DocumentsRouterDefinition = typeof documentsRouterDefinition;

export const documentsRouter: ReturnType<typeof router<DocumentsRouterDefinition>> =
  router(documentsRouterDefinition);
