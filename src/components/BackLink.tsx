import Link from "next/link";

/**
 * A consistent, accessible "back" link used at the top and bottom of every
 * screen that has a parent to return to. Rendering the same control in both
 * places means people never have to scroll back to the top to move back.
 *
 * - `variant="top"` sits above the page heading.
 * - `variant="bottom"` sits at the end of the page with a divider above it,
 *   so there is always a way back within reach after a long scroll.
 */
export function BackLink({
  href,
  label,
  variant = "top",
}: {
  href: string;
  label: string;
  variant?: "top" | "bottom";
}) {
  return (
    <p className={variant === "bottom" ? "back-link back-link--bottom" : "back-link"}>
      <Link href={href}>
        <span aria-hidden="true">←</span> {label}
      </Link>
    </p>
  );
}
