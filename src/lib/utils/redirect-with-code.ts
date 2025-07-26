import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/config/base-url";
import { SEARCH_PARAM_KEYS } from "@/config/search-param-keys";
import { logger } from "@/lib/logger";

interface RedirectWithCodeOptions {
	code?: string;
	nextUrl?: string;
}

export const redirectWithCode = (url: string, options?: RedirectWithCodeOptions) => {
	const { code, nextUrl } = options ?? {};
	const redirectUrl = new URL(url, BASE_URL);

	if (code) {
		redirectUrl.searchParams.set("code", code);
	}

	if (nextUrl) {
		redirectUrl.searchParams.set(SEARCH_PARAM_KEYS.nextUrl, nextUrl);
	}

	return redirect(redirectUrl.toString());
};

export const routeRedirectWithCode = (
	destination: string,
	options?: string | { code?: string; nextUrl?: string; request?: Request }
) => {
	if (!options) {
		return NextResponse.redirect(destination);
	}

	let url: URL;

	if (typeof options === "string") {
		url = new URL(destination, BASE_URL);
		url.searchParams.set(SEARCH_PARAM_KEYS.statusCode, options);
	} else {
		// Use BASE_URL as fallback if request.url is not available
		const baseUrl = options.request?.url || BASE_URL;
		url = new URL(destination, baseUrl);

		if (options?.nextUrl) {
			url.searchParams.set(SEARCH_PARAM_KEYS.nextUrl, options.nextUrl);
		}

		if (options?.code) {
			url.searchParams.set(SEARCH_PARAM_KEYS.statusCode, options.code);
		}
	}

	logger.info(`serverRedirectWithCode: Redirecting to ${url}`);
	return NextResponse.redirect(url);
};
