import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { approveOAuthAuthorization, denyOAuthAuthorization } from "./actions";

function scopeLabel(scope: string) {
  const labels: Record<string, string> = {
    openid: "Confirm your signed-in identity",
    email: "Confirm the email address on your BeAccessible account",
    profile: "Read basic profile information",
    offline_access: "Keep the connection active using refresh tokens",
  };
  return labels[scope] ?? scope;
}

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const authorizationId = sp.authorization_id;

  if (!authorizationId) {
    return (
      <main className="auth-wrap" id="main-content">
        <div className="card auth-card stack">
          <Logo />
          <h1>Connection request unavailable</h1>
          <p role="alert">This authorization request is missing its authorization ID. Return to ChatGPT and start the connection again.</p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    const returnTo = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
    redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  }

  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !data) {
    return (
      <main className="auth-wrap" id="main-content">
        <div className="card auth-card stack">
          <Logo />
          <h1>Unable to load connection request</h1>
          <p role="alert">{error?.message ?? "The authorization request could not be loaded."}</p>
        </div>
      </main>
    );
  }

  if ("redirect_url" in data) {
    redirect(data.redirect_url);
  }

  const scopes = data.scope.split(" ").filter(Boolean);

  return (
    <main className="auth-wrap" id="main-content">
      <div className="card auth-card stack">
        <div className="cluster" style={{ gap: 12 }}>
          <Logo />
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Connect BeAccessible Command Centre</h1>
            <p className="muted" style={{ margin: 0 }}>Secure OAuth authorization</p>
          </div>
        </div>

        {sp.error ? <p className="form-error" role="alert">{sp.error}</p> : null}

        <p>
          <strong>{data.client.name}</strong> is requesting permission to connect to your BeAccessible account.
        </p>

        <section aria-labelledby="permissions-heading">
          <h2 id="permissions-heading" style={{ fontSize: "1.15rem" }}>Requested permissions</h2>
          <ul>
            {scopes.map((scope) => <li key={scope}>{scopeLabel(scope)}</li>)}
          </ul>
        </section>

        <p className="muted">
          Signed in as {data.user.email}. After approval, the Command Centre itself will still restrict MCP access to the authorised owner account and will not expose email sending, bid submission, signing, or external commitments.
        </p>

        <p className="muted" style={{ overflowWrap: "anywhere" }}>
          Return address: {data.redirect_uri}
        </p>

        <div className="cluster" style={{ gap: 12 }}>
          <form action={approveOAuthAuthorization}>
            <input type="hidden" name="authorization_id" value={data.authorization_id} />
            <button type="submit" className="btn btn-primary">Allow connection</button>
          </form>
          <form action={denyOAuthAuthorization}>
            <input type="hidden" name="authorization_id" value={data.authorization_id} />
            <button type="submit" className="btn">Deny</button>
          </form>
        </div>
      </div>
    </main>
  );
}
