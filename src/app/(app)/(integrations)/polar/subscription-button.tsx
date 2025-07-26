import { Link } from "@/components/primitives/link-with-transition";

interface SubscriptionLinkProps {
	tier: string;
	className?: string;
}

export function SubscriptionButton({ tier, className }: SubscriptionLinkProps) {
	return (
		<Link href={`/polar/checkout?productPriceId=${tier}`} className={className}>
			Subscribe
		</Link>
	);
}
