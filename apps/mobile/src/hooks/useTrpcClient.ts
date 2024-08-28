import { trpc } from "@/utils/trpc";
import { useAuth } from "@clerk/clerk-expo";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  throw new Error(
    "Missing Backend URL. Please set EXPO_PUBLIC_BACKEND_URL in your .env"
  );
}

export const useTRPCClient = () => {
  const { getToken } = useAuth();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: backendUrl,
          transformer: superjson,
          headers: async () => {
            const token = await getToken();
            return {
              Authorization: token ? `Bearer ${token}` : "",
            };
          },
        }),
      ],
    })
  );

  return trpcClient;
};
