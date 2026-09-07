/* Ponto único de acesso a dados.
   Componentes consomem estas funções — nunca os arquivos de mock diretamente.
   Trocar mocks pela API real = alterar só este arquivo. */
import { proceduresMock } from "./mocks/procedures";
import { testimonialsMock } from "./mocks/testimonials";
import { resultsMock } from "./mocks/results";
import { postsMock, slotsMock } from "./mocks/schedule";
import {
  contactMock,
  quizGoalsMock,
  quizRecommendationsMock,
  treatmentOptionsMock,
} from "./mocks/quiz";
import type {
  BeforeAfter,
  ContactInfo,
  Post,
  Procedure,
  QuizGoal,
  QuizRecommendation,
  Slot,
  Testimonial,
  TreatmentCategory,
} from "./types";

export { TREATMENT_CATEGORIES } from "./types";

export function getProcedures(): Procedure[] {
  return proceduresMock;
}

/** Retorna o procedimento pelo slug (id) ou indefinido. */
export function getProcedureBySlug(slug: string): Procedure | undefined {
  return proceduresMock.find((item) => item.id === slug);
}

export function getTestimonials(): Testimonial[] {
  return testimonialsMock;
}

/** Retorna somente resultados COM consentimento explícito. */
export function getVisibleResults(): BeforeAfter[] {
  return resultsMock.filter((item) => item.hasConsent);
}

export function getAvailableSlots(): Slot[] {
  return slotsMock.filter((slot) => slot.available);
}

export function getPosts(): Post[] {
  return postsMock;
}

export function getProceduresByCategory(
  category: TreatmentCategory,
): Procedure[] {
  return proceduresMock.filter((item) => item.categories.includes(category));
}

export function getQuizGoals(): QuizGoal[] {
  return quizGoalsMock;
}

export function getRecommendation(
  goalId: string,
): QuizRecommendation | undefined {
  return quizRecommendationsMock.find((item) => item.goalId === goalId);
}

export function getTreatmentOptions(): string[] {
  return treatmentOptionsMock;
}

export function getContactInfo(): ContactInfo {
  return contactMock;
}
