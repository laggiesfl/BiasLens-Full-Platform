import Link from "next/link";

// Short page opening for the public sub-pages: one heading, one sentence, a way back home.
export function PublicPageIntro({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <section className="public-hero public-hero-compact">
      <div className="public-shell">
        <p className="public-breadcrumb"><Link href="/">BiasLens home</Link> <span aria-hidden="true">›</span> {kicker}</p>
        <span className="public-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p className="public-lead">{lead}</p>
      </div>
    </section>
  );
}
