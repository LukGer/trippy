import { trpc } from "@/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { Stack } from "expo-router";
import { useState } from "react";

import "../global.css";

const QUERY_CLIENT = new QueryClient();

export default function RootLayout() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={QUERY_CLIENT}>
      <QueryClientProvider client={QUERY_CLIENT}>
        <Stack />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
