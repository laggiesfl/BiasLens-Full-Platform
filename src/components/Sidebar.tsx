"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { t } from "@/lib/i18n";

interface NavItem {
  href: string;
  label: string;
  available: boolean;
}

interface SubItem {
  href: string | null;
  label: string;
  available: boolean;
}

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/dashboard",               label: t.nav.dashboard,    available: true },
    { href: "/assessments",             label: t.nav.assessments,  available: true },
    { href: "/metrics",                 label: t.nav.metrics,      available: true },
    { href: "/mapper",                  label: t.nav.mapper,       available: true },
    { href: "/requests",                label: t.nav.requests,     available: true },
    { href: "/builder",                 label: t.nav.builder,      available: true },
    { href: "/accessibility-statement", label: t.nav.accessibility, available: true },
    { href: "/privacy",                 label: t.nav.privacy,      available: true },
    { href: "/settings",                label: t.nav.settings,     available: true },
  ];

  const assessmentMatch = pathname.match(/^\/assessments\/([^/]+)/);
  const assessmentId = assessmentMatch?.[1] ?? null;

  const assessmentSubItems: SubItem[] = [
    {
      href: assessmentId ? `/assessments/${assessmentId}` : null,
      label: "Assessment overview",
      available: Boolean(assessmentId),
    },
    {
      href: assessmentId ? `/assessments/${assessmentId}/questionnaire` : null,
      label: "Bias risk questionnaire",
      available: Boolean(assessmentId),
    },
    {
      href: assessmentId ? `/assessments/${assessmentId}/report` : null,
      label: "Bias Risk Report",
      available: Boolean(assessmentId),
    },
    {
      href: assessmentId ? `/assessments/${assessmentId}/evidence` : null,
      label: "Evidence Log",
      available: Boolean(assessmentId),
    },
  ];

  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="brand">
        <Logo size={44} />
        <span>
          <span className="name">{t.product.name}</span>
          <br />
          <span className="sub">{t.product.by}</span>
        </span>
      </div>
      <nav aria-label="Main navigation">
        <ul>
          {items.map((item) => {
            const current =
              pathname === item.href || pathname.startsWith(item.href + "/");

            if (!item.available) {
              return (
                <li key={item.href}>
                  <span
                    className="disabled"
                    style={{ display: "block", padding: "11px 20px" }}
                    aria-disabled="true"
                  >
                    {item.label} <span className="nav-note">({t.nav.comingSoon})</span>
                  </span>
                </li>
              );
            }

            const isAssessments = item.href === "/assessments";

            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={current && !assessmentId ? "page" : undefined}>
                  {item.label}
                </Link>

                {isAssessments ? (
                  <ul
                    aria-label="Assessment sections"
                    style={{
                      margin: "0 0 6px 0",
                      padding: "0 0 0 18px",
                      listStyle: "none",
                    }}
                  >
                    {assessmentSubItems.map((sub) => {
                      const subCurrent = Boolean(
                        sub.href &&
                          (pathname === sub.href ||
                            (sub.label === "Assessment overview" && pathname === sub.href))
                      );

                      return (
                        <li key={sub.label}>
                          {sub.available && sub.href ? (
                            <Link
                              href={sub.href}
                              aria-current={subCurrent ? "page" : undefined}
                              style={{
                                display: "block",
                                padding: "8px 18px",
                                fontSize: "0.92rem",
                              }}
                            >
                              {sub.label}
                            </Link>
                          ) : (
                            <span
                              aria-disabled="true"
                              title="Create or open an assessment to use this section"
                              style={{
                                display: "block",
                                padding: "8px 18px",
                                fontSize: "0.92rem",
                                opacity: 0.55,
                                cursor: "not-allowed",
                              }}
                            >
                              {sub.label}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
