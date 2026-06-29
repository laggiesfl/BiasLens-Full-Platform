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

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/dashboard", label: t.nav.dashboard, available: true },
    { href: "/assessments", label: t.nav.assessments, available: true },
    { href: "/metrics", label: t.nav.metrics, available: false },
    { href: "/mapper", label: t.nav.mapper, available: false },
    { href: "/requests", label: t.nav.requests, available: false },
    { href: "/builder", label: t.nav.builder, available: false },
    { href: "/accessibility-statement", label: t.nav.accessibility, available: true },
    { href: "/privacy", label: t.nav.privacy, available: true },
    { href: "/settings", label: t.nav.settings, available: true },
  ];

  if (isAdmin) {
    items.push({ href: "/admin", label: t.nav.admin, available: false });
  }

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
                    {item.label}{" "}
                    <span className="nav-note">({t.nav.comingSoon})</span>
                  </span>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
