import "react-native-get-random-values";

import { tokenCache } from "@/utils/auth";
import { trpc } from "@/utils/trpc";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Stack } from "expo-router";
import { useState } from "react";
import superjson from "superjson";

import "../global.css";

dayjs.extend(relativeTime);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

if (!backendUrl) {
  throw new Error(
    "Missing Backend URL. Please set EXPO_PUBLIC_BACKEND_URL in your .env"
  );
}

const QUERY_CLIENT = new QueryClient();

export default function RootLayout() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: backendUrl,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <trpc.Provider client={trpcClient} queryClient={QUERY_CLIENT}>
          <QueryClientProvider client={QUERY_CLIENT}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </QueryClientProvider>
        </trpc.Provider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
