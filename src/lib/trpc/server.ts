import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers, type UnsafeUnwrappedHeaders } from "next/headers";
import { cache } from "react";

import { type AppRouter, createCaller } from "@/lib/trpc/api/root";
import { createTRPCContext } from "@/lib/trpc/api/trpc";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
	const heads = new Headers((await headers()) as unknown as UnsafeUnwrappedHeaders);
	heads.set("x-trpc-source", "rsc");

	return createTRPCContext({
		headers: heads,
	});
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient
);
