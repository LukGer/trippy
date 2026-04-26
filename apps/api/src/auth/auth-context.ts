import type { Auth } from "./auth";

export async function getSession(auth: Auth, request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export type Session = Awaited<ReturnType<typeof getSession>>;
