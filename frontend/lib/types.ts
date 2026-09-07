/* Tipos das entidades do site público.
   Contratos futuros da API devem espelhar estes formatos (ver spec mock-data). */

export type TreatmentCategory = "facial" | "corporal" | "rejuvenescimento";

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  "facial",
  "corporal",
  "rejuvenescimento",
];

export type Procedure = {
  id: string;
  name: string;
  description: string;
  duration: string;
  categories: TreatmentCategory[];
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  context: string;
};

export type BeforeAfter = {
  id: string;
  title: string;
  summary: string;
  sessions: string;
  recovery: string;
  goal: string;
  /** Consentimento explícito registrado. Sem consentimento, não exibe. */
  hasConsent: boolean;
};

export type Slot = {
  id: string;
  /** Data e hora de início em ISO. */
  start: string;
  durationMinutes: number;
  available: boolean;
};

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export type QuizGoal = {
  id: string;
  title: string;
  short: string;
};

export type QuizRecommendation = {
  goalId: string;
  protocol: string;
  description: string;
};

export type ContactInfo = {
  whatsapp: string;
  whatsappHref: string;
  hours: string[];
  address: string[];
};
