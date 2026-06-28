/**
 * English (en) user-facing strings.
 *
 * Internationalisation readiness (Section 17.5): user-facing strings live in
 * dictionaries like this one so they can be translated. Future target
 * languages: isiXhosa, isiZulu, Afrikaans, Sesotho, Setswana.
 */
export const en = {
  product: {
    name: "BiasLens",
    tagline: "Algorithmic bias testing and accountability",
    by: "by BeAccessible",
  },
  nav: {
    dashboard: "Dashboard",
    assessments: "My Assessments",
    questionnaire: "Bias Risk Questionnaire",
    metrics: "Fairness Metrics Calculator",
    mapper: "Compliance Mapper",
    requests: "Access Request Generator",
    builder: "AIA / FRIA Builder",
    evidence: "Evidence Library",
    reports: "Reports and Exports",
    accessibility: "Accessibility Statement",
    privacy: "Privacy Notice",
    settings: "Account Settings",
    admin: "Admin Console",
    comingSoon: "Coming in a later sprint",
  },
  common: {
    skipToContent: "Skip to main content",
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Sign out",
    save: "Save",
    cancel: "Cancel",
    create: "Create",
    delete: "Delete",
    edit: "Edit",
    open: "Open",
    loading: "Loading…",
    help: "Help",
    organisation: "Organisation",
    role: "Role",
  },
  auth: {
    loginTitle: "Sign in to BiasLens",
    signupTitle: "Create your BiasLens account",
    emailLabel: "Email address",
    passwordLabel: "Password",
    nameLabel: "Full name",
    forgotPassword: "Forgot your password?",
    resetTitle: "Reset your password",
    sendReset: "Send reset link",
    magicLink: "Email me a sign-in link instead",
    noAccount: "Do not have an account yet?",
    haveAccount: "Already have an account?",
    checkEmail:
      "Check your email for a confirmation or sign-in link. You can close this tab once you have it.",
  },
  status: {
    draft: "Draft",
    in_review: "In review",
    completed: "Completed",
    exported: "Exported",
    archived: "Archived",
  },
};

export type Strings = typeof en;
