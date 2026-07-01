"use client";

/**
 * A submit button that asks the person to confirm before a destructive,
 * hard-to-reverse action runs (WCAG 2.2 AAA 3.3.6 Error Prevention).
 * It stays a real <button type="submit"> so keyboard and screen-reader
 * behaviour, and the surrounding <form> server action, are unchanged.
 */
export function ConfirmSubmit({
  children,
  confirmMessage,
  className = "btn btn-danger",
  style,
}: {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
