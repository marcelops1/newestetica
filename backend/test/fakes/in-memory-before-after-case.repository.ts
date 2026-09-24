import type { BeforeAfterCase } from "../../src/content/domain/entities/before-after-case.entity";
import type { BeforeAfterCaseRepository } from "../../src/content/domain/ports/before-after-case.repository";

export class InMemoryBeforeAfterCaseRepository implements BeforeAfterCaseRepository {
  private readonly cases: BeforeAfterCase[];

  constructor(initial: BeforeAfterCase[] = []) {
    this.cases = [...initial];
  }

  async findConsented(): Promise<BeforeAfterCase[]> {
    return this.cases.filter((item) => item.hasConsent);
  }
}
