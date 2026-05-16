import { z } from "zod";

export const documentKinds = [
  "flight",
  "hotel",
  "train",
  "rental_car",
  "passport",
  "visa",
  "insurance",
  "ticket",
  "note",
  "other",
] as const;

export const documentSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  title: z.string(),
  kind: z.enum(documentKinds),
  sensitive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createDocumentInputSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  kind: z.enum(documentKinds).default("other"),
  fileKey: z.string().min(1).optional(),
  mimeType: z.string().min(1).optional(),
  textContent: z.string().optional(),
  structuredData: z.record(z.string(), z.unknown()).optional(),
  sensitive: z.boolean().default(false),
});

export type DocumentKind = (typeof documentKinds)[number];
export type Document = z.infer<typeof documentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
