import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "@trippy/api/router";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type PropsWithChildren, useState } from "react";
import { getApiUrl } from "./api-url";

export const trpc = createTRPCReact<AppRouter>();

export function TrippyApiProvider({ children }: PropsWithChildren) {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${getApiUrl()}/trpc`,
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				{children}
			</trpc.Provider>
		</QueryClientProvider>
	);
}
