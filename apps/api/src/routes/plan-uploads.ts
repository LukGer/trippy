import type { Hono } from "hono";
import type { ApiEnv } from "../env";

const MAX_BYTES = 15 * 1024 * 1024;

function inferKind(
	mime: string,
	filename: string,
): "pdf" | "image" | "text" | "other" {
	const m = mime.toLowerCase();
	const lower = filename.toLowerCase();
	if (m.includes("pdf") || lower.endsWith(".pdf")) return "pdf";
	if (m.startsWith("image/")) return "image";
	if (m.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md"))
		return "text";
	return "other";
}

export function registerPlanUploadRoutes(app: Hono<ApiEnv>) {
	app.post("/api/plan-uploads", async (c) => {
		const bucket = c.env.PLAN_UPLOADS;
		if (!bucket) {
			return c.json(
				{ error: "File uploads are not configured (missing R2 binding)." },
				503,
			);
		}

		let body: Record<string, string | File>;
		try {
			body = (await c.req.parseBody()) as Record<string, string | File>;
		} catch {
			return c.json({ error: "Invalid multipart body." }, 400);
		}

		const file = body.file;
		if (!file || typeof file === "string") {
			return c.json({ error: 'Expected multipart field "file".' }, 400);
		}

		if (file.size > MAX_BYTES) {
			return c.json({ error: "File exceeds 15 MB limit." }, 413);
		}

		const buf = new Uint8Array(await file.arrayBuffer());
		const mime =
			file.type && file.type.length > 0
				? file.type
				: "application/octet-stream";
		const name = file.name?.trim() || "attachment";
		const kind = inferKind(mime, name);

		const id = crypto.randomUUID();
		await bucket.put(id, buf, {
			httpMetadata: { contentType: mime },
			customMetadata: { name, kind },
		});

		return c.json({ id, name, kind });
	});
}
