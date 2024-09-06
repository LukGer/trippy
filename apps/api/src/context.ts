import { createClerkClient } from "@clerk/backend";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Resource } from "sst";

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const client = createClerkClient({
    publishableKey: Resource.ClerkPublishableKey.value,
    secretKey: Resource.ClerkSecretKey.value,
  });

  const userId = req.headers.get("authorization");

  if (!userId) {
    return { req, resHeaders, user: null };
  }

  const user = await client.users.getUser(userId);

  return { req, resHeaders, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
