import { z } from "zod";

/** Objetivo do simulador público. Espelha `QuizGoal` dos mocks. */
export const QuizGoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
});

/** Recomendação por objetivo: `goalId` referencia um objetivo existente. */
export const QuizRecommendationSchema = z.object({
  goalId: z.string().min(1),
  protocol: z.string().min(1),
  description: z.string().min(1),
});

export const TreatmentOptionSchema = z.string().min(1);

/** Opções de "tratamento de interesse" do modal de agendamento. */
export const TreatmentOptionsSchema = z.array(TreatmentOptionSchema).min(1);

export type QuizGoal = z.infer<typeof QuizGoalSchema>;
export type QuizRecommendation = z.infer<typeof QuizRecommendationSchema>;
export type TreatmentOption = z.infer<typeof TreatmentOptionSchema>;
