"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type React from "react";
import { type MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
	children,
	radius = 350,
	color = "#262626",
	className,
	...props
}: {
	radius?: number;
	color?: string;
	children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent<HTMLDivElement>) {
		const { left, top } = currentTarget.getBoundingClientRect();

		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}

	const [isHovering, setIsHovering] = useState(false);
	const handleMouseEnter = () => setIsHovering(true);
	const handleMouseLeave = () => setIsHovering(false);
	return (
		<div
			className={cn(
				"group/spotlight relative rounded-md border border-neutral-800 bg-black p-10 dark:border-neutral-800",
				className
			)}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			{...props}
		>
			<motion.div
				className="pointer-events-none absolute -inset-px z-0 rounded-md opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
				style={{
					backgroundColor: color,
					maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
				}}
			>
				{isHovering && (
					<CanvasRevealEffect
						animationSpeed={5}
						containerClassName="bg-transparent absolute inset-0 pointer-events-none"
						colors={[
							[59, 130, 246],
							[139, 92, 246],
						]}
						dotSize={3}
					/>
				)}
			</motion.div>
			{children}
		</div>
	);
};
