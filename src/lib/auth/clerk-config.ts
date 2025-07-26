import { env } from "@/env";

/**
 * Clerk Configuration
 *
 * This file contains configuration settings for Clerk authentication.
 * Only used when Clerk is the active authentication strategy.
 */

/**
 * Check if Clerk is properly configured
 */
export function isClerkConfigured(): boolean {
	return !!(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
}

/**
 * Clerk publishable key for client-side operations
 */
export function getClerkPublishableKey(): string {
	if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
		throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not configured");
	}
	return env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

/**
 * Clerk secret key for server-side operations
 */
export function getClerkSecretKey(): string {
	if (!env.CLERK_SECRET_KEY) {
		throw new Error("CLERK_SECRET_KEY is not configured");
	}
	return env.CLERK_SECRET_KEY;
}

/**
 * Clerk webhook secret for verifying webhooks
 * Falls back to AUTH_SECRET if CLERK_WEBHOOK_SECRET is not provided
 */
export function getClerkWebhookSecret(): string | undefined {
	return env.CLERK_WEBHOOK_SECRET;
}

/**
 * Clerk configuration options
 */
export const clerkConfig = {
	// Appearance customization to match Shipkit's design
	appearance: {
		elements: {
			// Customize Clerk components to match Tailwind/Shadcn styling
			formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
			formFieldInput: "border border-input bg-background text-foreground",
			card: "bg-card text-card-foreground shadow-lg",
		},
		layout: {
			socialButtonsPlacement: "top" as const,
			showOptionalFields: false,
		},
	},
	// Sign-in and sign-up URLs that match Shipkit's routing
	signInUrl: "/sign-in",
	signUpUrl: "/sign-up",
	afterSignInUrl: "/dashboard",
	afterSignUpUrl: "/dashboard",
	// Clerk dashboard redirect for user management
	userProfileUrl: "/settings/profile",
} as const;

/**
 * Protected routes that require authentication when using Clerk
 */
export const clerkProtectedRoutes = [
	"/dashboard",
	"/settings",
	"/projects",
	"/teams",
	"/api-keys",
	"/admin",
] as const;

/**
 * Public routes that should be accessible without authentication
 */
export const clerkPublicRoutes = [
	"/",
	"/features",
	"/pricing",
	"/docs",
	"/blog",
	"/contact",
	"/sign-in",
	"/sign-up",
	"/forgot-password",
	"/reset-password",
	"/api/webhooks/clerk",
	"/api/docs",
] as const;
