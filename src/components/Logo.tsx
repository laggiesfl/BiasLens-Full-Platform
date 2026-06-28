/**
 * Temporary BeAccessible logo placeholder (Section 16.4).
 * Replace with the official circular badge asset when supplied:
 * place it at /public/beaccessible-logo.png and swap this component for an <img>.
 */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <span
      className="logo"
      role="img"
      aria-label="BeAccessible logo placeholder — replace with official badge"
      style={{ width: size, height: size, fontSize: size * 0.28 }}
    >
      BA
    </span>
  );
}
