import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { roleLabel, type Role } from "@/lib/roles";
import { t } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarded, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) {
    redirect("/onboarding");
  }

  const isAdmin = profile.role === "admin" || profile.is_super_admin === true;

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {t.common.skipToContent}
      </a>
      <Sidebar isAdmin={isAdmin} />
      <Topbar
        email={user.email ?? ""}
        roleLabel={roleLabel(profile.role as Role)}
        organisation="Personal workspace"
      />
      <main className="main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
