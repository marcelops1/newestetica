import { describe, expect, it } from "vitest";
import {
  quizGoalsMock,
  quizRecommendationsMock,
  treatmentOptionsMock,
} from "../../../frontend/lib/mocks/quiz";
import {
  QuizGoalSchema,
  QuizRecommendationSchema,
  TreatmentOptionsSchema,
} from "./quiz";

describe("contrato do quiz e das opções de tratamento", () => {
  it("os objetivos do quiz são compatíveis", () => {
    for (const item of quizGoalsMock) {
      const result = QuizGoalSchema.safeParse(item);
      expect(result.success, `objetivo mockado ${item.id}`).toBe(true);
    }
  });

  it("as recomendações do quiz são compatíveis", () => {
    for (const item of quizRecommendationsMock) {
      const result = QuizRecommendationSchema.safeParse(item);
      expect(result.success, `recomendação do objetivo ${item.goalId}`).toBe(
        true,
      );
    }
  });

  it("as opções de tratamento do modal são compatíveis", () => {
    expect(TreatmentOptionsSchema.safeParse(treatmentOptionsMock).success).toBe(
      true,
    );
  });

  it("toda recomendação aponta para um objetivo existente", () => {
    const goalIds = new Set(quizGoalsMock.map((goal) => goal.id));
    for (const item of quizRecommendationsMock) {
      expect(goalIds.has(item.goalId), `objetivo ${item.goalId}`).toBe(true);
    }
  });

  it("rejeita objetivo, recomendação e opção com campos vazios", () => {
    expect(
      QuizGoalSchema.safeParse({ id: "x", title: "", short: "Descrição." })
        .success,
    ).toBe(false);
    expect(
      QuizRecommendationSchema.safeParse({
        goalId: "",
        protocol: "Protocolo fictício",
        description: "Descrição fictícia.",
      }).success,
    ).toBe(false);
    expect(TreatmentOptionsSchema.safeParse([""]).success).toBe(false);
    expect(TreatmentOptionsSchema.safeParse([]).success).toBe(false);
  });
});
