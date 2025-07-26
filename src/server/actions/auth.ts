"use server";

import { z } from "zod";
import { createServerAction } from "zsa";
import { BASE_URL } from "@/config/base-url";
import { RESEND_FROM_EMAIL } from "@/config/constants";
import { STATUS_CODES } from "@/config/status-codes";
import { env } from "@/env";
import { resend } from "@/lib/resend";
import { forgotPasswordSchema, resetPasswordSchema, signInActionSchema } from "@/lib/schemas/auth";
import type { ActionState } from "@/lib/utils/validated-action";
import { AuthService } from "@/server/services/auth-service";
import type { UserRole } from "@/types/user";

export interface AuthOptions {
	redirectTo?: string;
	redirect?: boolean;
	protect?: boolean;
	role?: UserRole;
	nextUrl?: string;
	errorCode?: string;
	email?: string;
}

export const signInWithOAuthAction = async ({
	providerId,
	options,
}: {
	providerId: string;
	options?: AuthOptions;
}) => {
	return await AuthService.signInWithOAuth(providerId, options);
};

export const signInAction = createServerAction()
	.input(signInActionSchema)
	.handler(async ({ input }) => {
		await AuthService.signInWithCredentials({
			email: input.email,
			password: input.password,
			redirect: input.redirect,
			redirectTo: input.redirectTo,
		});
		return null;
	});

const CredentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(4),
	redirect: z.boolean().optional(),
	redirectTo: z.string().optional(),
});

type SignInCredentialsInput = z.infer<typeof CredentialsSchema>;

export const signInWithCredentialsAction = async (input: SignInCredentialsInput) => {

	// Validate input using the schema (optional but good practice)
	const parsed = CredentialsSchema.safeParse(input);
	if (!parsed.success) {
		console.error("Invalid input to signInWithCredentialsAction:", parsed.error);
		return { success: false, error: "Invalid input data" };
	}

	const { email, password, redirect, redirectTo } = parsed.data;

	try {
		const result = await AuthService.signInWithCredentials({
			email,
			password,
			redirect: redirect ?? false, // Use provided redirect, default to false
			redirectTo,
		});
		return result;
	} catch (error: any) {
		console.error("Error in signInWithCredentialsAction:", error);

		// Check if it's an AuthError from next-auth
		if (error.type === "CredentialsSignin" || error.code === "CredentialsSignin") {
			return { success: false, error: STATUS_CODES.CREDENTIALS.message };
		}

		return { success: false, error: error.message || "Sign in failed" };
	}
};

export const signUpWithCredentialsAction = async (_prevState: ActionState, formData: FormData) => {

	const parsed = CredentialsSchema.safeParse(Object.fromEntries(formData));

	if (!parsed.success) {
		return { success: false, error: "Invalid form data" };
	}
	try {
		const result = await AuthService.signUpWithCredentials(parsed.data);

		if (!result.success || !result.user) {
			return { success: false, error: result.error || "Sign up failed" };
		}

		// Send verification email (moved from auth service for clarity)
		try {
			if (!resend) {
				console.warn("Resend client not initialized - skipping verification email");
			} else {
				const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL || "noreply@example.com";
				await resend.emails.send({
					from: RESEND_FROM_EMAIL,
					to: parsed.data.email,
					subject: "Welcome to Our App - Verify Your Email",
					html: `
            <p>Welcome! Please verify your email by clicking the link below:</p>
            <a href="${BASE_URL}/verify-email?token=${result.user.verificationToken}">Verify Email</a>
          `,
				});
			}
		} catch (emailError) {
			console.error("Failed to send verification email", emailError);
			// Proceed with sign-up even if email fails, but log the error
		}

		return { success: true, user: result.user }; // Only return necessary info
	} catch (error: any) {
		console.error("Error in signUpWithCredentialsAction:", error);
		return { success: false, error: error.message || "Sign up failed" };
	}
};

export const signOutAction = async (options?: AuthOptions) => {
	return await AuthService.signOut(options);
};

export const forgotPasswordAction = createServerAction()
	.input(forgotPasswordSchema)
	.handler(async ({ input }) => {
		try {
			await AuthService.forgotPassword(input.email);
			return { success: true };
		} catch (error) {
			console.error("Error in forgotPasswordAction:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : STATUS_CODES.AUTH_ERROR.message,
			};
		}
	});

export const resetPasswordAction = createServerAction()
	.input(resetPasswordSchema)
	.handler(async ({ input }) => {
		try {
			await AuthService.resetPassword(input.token, input.password);
			return { success: true };
		} catch (error) {
			console.error("Error in resetPasswordAction:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : STATUS_CODES.AUTH_ERROR.message,
			};
		}
	});
