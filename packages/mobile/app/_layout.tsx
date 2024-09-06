import "react-native-get-random-values";

import { tokenCache } from "@/src/utils/auth";
import { trpc } from "@/src/utils/trpc";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Stack } from "expo-router";

import { useTRPCClient } from "@/src/hooks/useTrpcClient";
import "../global.css";

dayjs.extend(relativeTime);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

const QUERY_CLIENT = new QueryClient();

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <QueryClientProvider client={QUERY_CLIENT}>
          <TrpcProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </TrpcProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function TrpcProvider({ children }: { children: React.ReactNode }) {
  const trpcClient = useTRPCClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={QUERY_CLIENT}>
      {children}
    </trpc.Provider>
  );
}
