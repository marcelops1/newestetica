import type { BeforeAfterCase as BeforeAfterCaseRecord } from "../../../../generated/prisma/client";
import { BeforeAfterCase } from "../../../domain/entities/before-after-case.entity";

export function toBeforeAfterCaseDomain(
  record: BeforeAfterCaseRecord,
): BeforeAfterCase {
  return BeforeAfterCase.restore({
    id: record.id,
    title: record.title,
    summary: record.summary,
    sessions: record.sessions,
    recovery: record.recovery,
    goal: record.goal,
    hasConsent: record.hasConsent,
  });
}
