/**
 * BeAccessible logo. Expects the official badge at /public/beaccessible-logo.png.
 * Circular crop so it sits cleanly on both light and dark backgrounds.
 */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/beaccessible-logo.png"
      width={size}
      height={size}
      alt="BeAccessible logo — circular badge with wheelchair user, pram, shopping trolley and accessibility ramp icons; text reads BeAccessible, Creating Access for All"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        display: "block",
        flexShrink: 0,
        objectFit: "cover",
      }}
    />
  );
}
