import { describe, expect, it } from "vitest";
import { BeforeAfterCase } from "../../domain/entities/before-after-case.entity";
import { Post } from "../../domain/entities/post.entity";
import { PostNotFound } from "../../domain/errors/errors";
import { InMemoryBeforeAfterCaseRepository } from "../../../../test/fakes/in-memory-before-after-case.repository";
import { InMemoryPostRepository } from "../../../../test/fakes/in-memory-post.repository";
import { GetPostBySlugUseCase } from "./get-post-by-slug.use-case";
import { ListBeforeAfterUseCase } from "./list-before-after.use-case";

/* Adversarial (docs/07 §16d): entradas hostis REAIS contra a superfície da aplicação,
   como defesa em profundidade — mesmo que a fronteira HTTP valide antes, o núcleo não
   confia na entrada. O slug é opaco por desenho: nunca vira caminho, comando ou query. */

const hostileSlugs = [
  "../../etc/passwd",
  "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
  "' OR '1'='1",
  'slug"; DROP TABLE "Post"; --',
  "x".repeat(10_000),
  "\u0000\u0001\u001f",
  "",
];

describe("adversarial — entradas hostis contra os casos de uso", () => {
  it("slug gigante, malformado ou com injeção responde PostNotFound (sem crash nem erro interno)", async () => {
    const useCase = new GetPostBySlugUseCase(new InMemoryPostRepository([]));

    for (const slug of hostileSlugs) {
      await expect(
        useCase.execute(slug),
        `slug hostil: ${slug.slice(0, 30)}`,
      ).rejects.toThrow(PostNotFound);
    }
  });

  it("slug hostil não encontra post alheio: injeção é tratada como string opaca", async () => {
    const post = Post.create({
      id: "cuidados-com-a-pele-aos-40",
      title: "Cuidados com a pele a partir dos 40",
      excerpt: "Resumo 100% fictício.",
      category: "Cuidados diários",
      content: ["Parágrafo fictício."],
      publishedAt: "2026-08-20",
    });
    const useCase = new GetPostBySlugUseCase(new InMemoryPostRepository([post]));

    await expect(useCase.execute("' OR '1'='1")).rejects.toThrow(PostNotFound);
  });

  it("sonda de bypass: a aplicação não oferece acesso direto a caso por id — só a listagem consentida", () => {
    const surface = Object.getOwnPropertyNames(
      ListBeforeAfterUseCase.prototype,
    ).sort();

    /* Tripwire explícito (abuse case 3 do threat model): não existe rota de detalhe para
       casos, logo não há superfície para enumerar/adivinhar id de caso sem consentimento.
       Qualquer acesso por id adicionado aqui quebra este teste e exige revisão da regra. */
    expect(surface).toEqual(["constructor", "execute"]);
  });

  it("listagem de casos nunca inclui id sem consentimento, mesmo existindo no repositório", async () => {
    const base = {
      title: "Caso fictício",
      summary: "Resumo 100% fictício.",
      sessions: "1 sessão",
      recovery: "Imediato (sem downtime)",
      goal: "Firmeza",
    };
    const useCase = new ListBeforeAfterUseCase(
      new InMemoryBeforeAfterCaseRepository([
        BeforeAfterCase.restore({
          ...base,
          id: "resultado-com",
          hasConsent: true,
        }),
        BeforeAfterCase.restore({
          ...base,
          id: "resultado-sem",
          hasConsent: false,
        }),
      ]),
    );

    const cases = await useCase.execute();

    expect(cases.map((item) => item.id)).toEqual(["resultado-com"]);
    expect(cases.map((item) => item.id)).not.toContain("resultado-sem");
  });
});
