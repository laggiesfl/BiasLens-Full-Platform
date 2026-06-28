export default function AccessibilityStatementPage() {
  return (
    <div className="stack" style={{ maxWidth: "75ch" }}>
      <div className="page-header">
        <h1>Accessibility Statement</h1>
        <p>
          Accessibility is a core part of BiasLens, not an afterthought. This
          platform is built and tested by BeAccessible to be usable by everyone.
        </p>
      </div>

      <section className="card stack">
        <h2 style={{ fontSize: "1.2rem" }}>Our commitment</h2>
        <p>
          We target <strong>WCAG 2.2 Level AAA</strong> wherever feasible, and
          treat <strong>WCAG 2.1 Level AA</strong> as the minimum standard for
          release. We apply Universal Design across navigation, content, forms,
          tables, workflows and exported documents.
        </p>

        <h2 style={{ fontSize: "1.2rem" }}>What we have built in</h2>
        <ul>
          <li>A skip-to-main-content link on every page.</li>
          <li>Semantic landmarks and a logical heading order.</li>
          <li>Full keyboard operation with a visible focus indicator.</li>
          <li>Form labels joined to their fields and clear error messages.</li>
          <li>Status and risk shown with text and symbols, never colour alone.</li>
          <li>Touch targets of at least 48 by 48 pixels.</li>
          <li>Support for reduced motion and text resizing up to 400%.</li>
          <li>Plain-language guidance throughout.</li>
        </ul>

        <h2 style={{ fontSize: "1.2rem" }}>Known limitations</h2>
        <p>
          Level AAA cannot be guaranteed for every legal text, every browser and
          assistive-technology combination, every generated document reader, or
          future translated content without manual review. We run automated and
          manual accessibility testing before each release.
        </p>

        <h2 style={{ fontSize: "1.2rem" }}>Contact us</h2>
        <p>
          If you find an accessibility barrier, please tell us at{" "}
          <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a>{" "}
          so we can fix it.
        </p>
      </section>
    </div>
  );
}
