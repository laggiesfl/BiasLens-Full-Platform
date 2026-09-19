"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function authorizationId(formData: FormData) {
  return String(formData.get("authorization_id") ?? "").trim();
}

export async function approveOAuthAuthorization(formData: FormData) {
  const id = authorizationId(formData);
  if (!id) redirect("/oauth/consent?error=" + encodeURIComponent("Missing authorization request."));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.oauth.approveAuthorization(id, { skipBrowserRedirect: true });

  if (error || !data?.redirect_url) {
    redirect(`/oauth/consent?authorization_id=${encodeURIComponent(id)}&error=${encodeURIComponent(error?.message ?? "Unable to approve this connection.")}`);
  }

  redirect(data.redirect_url);
}

export async function denyOAuthAuthorization(formData: FormData) {
  const id = authorizationId(formData);
  if (!id) redirect("/oauth/consent?error=" + encodeURIComponent("Missing authorization request."));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.oauth.denyAuthorization(id, { skipBrowserRedirect: true });

  if (error || !data?.redirect_url) {
    redirect(`/oauth/consent?authorization_id=${encodeURIComponent(id)}&error=${encodeURIComponent(error?.message ?? "Unable to deny this connection.")}`);
  }

  redirect(data.redirect_url);
}
