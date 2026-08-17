export type GuideLanguage = "en" | "zu" | "xh" | "af" | "fr" | "es";

export type GuideLanguageConfig = {
  code: GuideLanguage;
  label: string;
  locale: string;
  placeholder: string;
  send: string;
  speak: string;
  listen: string;
  stop: string;
  privacyNote: string;
  welcome: string;
};

export const GUIDE_LANGUAGES: GuideLanguageConfig[] = [
  {
    code: "en",
    label: "English",
    locale: "en-ZA",
    placeholder: "Ask about BiasLens or your AI system…",
    send: "Send",
    speak: "Speak",
    listen: "Listen to answer",
    stop: "Stop",
    privacyNote: "Please do not share employee, applicant, health, disability or other sensitive person-level information here.",
    welcome: "Hello. I’m the BiasLens Guide. I can help you understand BiasLens, algorithmic bias, evidence readiness, accessibility and what your organisation should be asking about an AI system.",
  },
  {
    code: "zu",
    label: "isiZulu",
    locale: "zu-ZA",
    placeholder: "Buza nge-BiasLens noma ngohlelo lwakho lwe-AI…",
    send: "Thumela",
    speak: "Khuluma",
    listen: "Lalela impendulo",
    stop: "Misa",
    privacyNote: "Sicela ungabelani lapha ngolwazi lomuntu olubucayi, olufana nolwabasebenzi, abafake izicelo, impilo noma ukukhubazeka.",
    welcome: "Sawubona. Ngingu-BiasLens Guide. Ngingakusiza uqonde i-BiasLens, ukuchema kwe-algorithm, ubufakazi obudingekayo, ukufinyeleleka, nemibuzo okufanele inhlangano yakho iyibuze ngohlelo lwe-AI.",
  },
  {
    code: "xh",
    label: "isiXhosa",
    locale: "xh-ZA",
    placeholder: "Buza nge-BiasLens okanye ngenkqubo yakho ye-AI…",
    send: "Thumela",
    speak: "Thetha",
    listen: "Mamela impendulo",
    stop: "Yeka",
    privacyNote: "Nceda ungabelani apha ngolwazi lomntu olubuthathaka, olufana nolwabasebenzi, abafaki-zicelo, impilo okanye ukukhubazeka.",
    welcome: "Molo. Ndingu-BiasLens Guide. Ndingakunceda uqonde i-BiasLens, ukucalucalulwa kwe-algorithm, ukulungela ubungqina, ukufikeleleka, nemibuzo ekufuneka umbutho wakho uyibuze ngenkqubo ye-AI.",
  },
  {
    code: "af",
    label: "Afrikaans",
    locale: "af-ZA",
    placeholder: "Vra oor BiasLens of jou KI-stelsel…",
    send: "Stuur",
    speak: "Praat",
    listen: "Luister na antwoord",
    stop: "Stop",
    privacyNote: "Moet asseblief nie sensitiewe persoonlike inligting oor werknemers, aansoekers, gesondheid, gestremdheid of ander individue hier deel nie.",
    welcome: "Hallo. Ek is die BiasLens Guide. Ek kan jou help om BiasLens, algoritmiese vooroordeel, bewysgereedheid, toeganklikheid en die vrae wat jou organisasie oor ’n KI-stelsel behoort te vra, te verstaan.",
  },
  {
    code: "fr",
    label: "Français",
    locale: "fr-FR",
    placeholder: "Posez une question sur BiasLens ou votre système d’IA…",
    send: "Envoyer",
    speak: "Parler",
    listen: "Écouter la réponse",
    stop: "Arrêter",
    privacyNote: "Veuillez ne pas partager ici de données personnelles sensibles concernant des employés, candidats, informations de santé, handicap ou autres personnes.",
    welcome: "Bonjour. Je suis le BiasLens Guide. Je peux vous aider à comprendre BiasLens, les biais algorithmiques, la préparation des preuves, l’accessibilité et les questions à poser au sujet d’un système d’IA.",
  },
  {
    code: "es",
    label: "Español",
    locale: "es-ES",
    placeholder: "Pregunta sobre BiasLens o tu sistema de IA…",
    send: "Enviar",
    speak: "Hablar",
    listen: "Escuchar la respuesta",
    stop: "Detener",
    privacyNote: "No compartas aquí información personal sensible sobre empleados, candidatos, salud, discapacidad u otras personas.",
    welcome: "Hola. Soy BiasLens Guide. Puedo ayudarte a comprender BiasLens, el sesgo algorítmico, la preparación de evidencias, la accesibilidad y las preguntas que tu organización debería hacer sobre un sistema de IA.",
  },
];

export const STARTER_QUESTIONS: Record<GuideLanguage, string[]> = {
  en: [
    "What does BiasLens do?",
    "Could BiasLens assess our AI system?",
    "What evidence should we have about an AI system?",
    "What are the different types of algorithmic bias?",
    "What is an Algorithm Defence File?",
    "How does BiasLens consider disability and accessibility?",
    "What should we ask an AI vendor about bias?",
    "How do I start an assessment?",
  ],
  zu: [
    "Yenzani i-BiasLens?",
    "Ingabe i-BiasLens ingahlola uhlelo lwethu lwe-AI?",
    "Yibuphi ubufakazi okufanele sibe nabo ngohlelo lwe-AI?",
    "Yiziphi izinhlobo zokuchema kwe-algorithm?",
    "Iyini i-Algorithm Defence File?",
    "I-BiasLens ikubheka kanjani ukukhubazeka nokufinyeleleka?",
    "Yini okufanele siyibuze umhlinzeki we-AI ngokuchema?",
    "Ngiqala kanjani ukuhlolwa?",
  ],
  xh: [
    "Yenza ntoni i-BiasLens?",
    "Ngaba i-BiasLens ingayihlola inkqubo yethu ye-AI?",
    "Bubuphi ubungqina ekufuneka sibe nabo ngenkqubo ye-AI?",
    "Zeziphi iintlobo zokucalucalulwa kwe-algorithm?",
    "Yintoni i-Algorithm Defence File?",
    "I-BiasLens ikujonga njani ukukhubazeka nokufikeleleka?",
    "Yintoni ekufuneka siyibuze umthengisi we-AI malunga nokucalucalulwa?",
    "Ndiqala njani uvavanyo?",
  ],
  af: [
    "Wat doen BiasLens?",
    "Kan BiasLens ons KI-stelsel beoordeel?",
    "Watter bewyse behoort ons oor ’n KI-stelsel te hê?",
    "Wat is die verskillende tipes algoritmiese vooroordeel?",
    "Wat is ’n Algorithm Defence File?",
    "Hoe hanteer BiasLens gestremdheid en toeganklikheid?",
    "Wat behoort ons ’n KI-verskaffer oor vooroordeel te vra?",
    "Hoe begin ek ’n beoordeling?",
  ],
  fr: [
    "Que fait BiasLens ?",
    "BiasLens peut-il évaluer notre système d’IA ?",
    "Quelles preuves devrions-nous avoir sur un système d’IA ?",
    "Quels sont les différents types de biais algorithmiques ?",
    "Qu’est-ce qu’un Algorithm Defence File ?",
    "Comment BiasLens prend-il en compte le handicap et l’accessibilité ?",
    "Que devrions-nous demander à un fournisseur d’IA au sujet des biais ?",
    "Comment commencer une évaluation ?",
  ],
  es: [
    "¿Qué hace BiasLens?",
    "¿Puede BiasLens evaluar nuestro sistema de IA?",
    "¿Qué evidencias deberíamos tener sobre un sistema de IA?",
    "¿Cuáles son los distintos tipos de sesgo algorítmico?",
    "¿Qué es un Algorithm Defence File?",
    "¿Cómo considera BiasLens la discapacidad y la accesibilidad?",
    "¿Qué deberíamos preguntar a un proveedor de IA sobre el sesgo?",
    "¿Cómo comienzo una evaluación?",
  ],
};

export function isGuideLanguage(value: unknown): value is GuideLanguage {
  return typeof value === "string" && GUIDE_LANGUAGES.some((language) => language.code === value);
}

export function getGuideLanguage(code: GuideLanguage): GuideLanguageConfig {
  return GUIDE_LANGUAGES.find((language) => language.code === code) ?? GUIDE_LANGUAGES[0];
}
