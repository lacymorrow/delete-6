import type { HTMLAttributes } from "react";
import { FontProvider } from "@/components/providers/font-provider";
import { cn } from "@/lib/utils";

interface TypographyProviderProps extends HTMLAttributes<HTMLDivElement> {
	unstyled?: boolean;
}

export function TypographyProvider({
	children,
	className,
	unstyled,
	...props
}: TypographyProviderProps) {
	// For some reason the body font class in the pages router doesn't get the font, so we need to wrap the children in a font provider
	return (
		<FontProvider
			className={cn(!unstyled && "prose prose-slate dark:prose-invert", className)}
			{...props}
		>
			{children}
		</FontProvider>
	);
}
