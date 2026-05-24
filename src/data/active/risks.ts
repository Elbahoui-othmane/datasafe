import { isAssessmentMode } from "@/config/dataSource";
import { generatedRisks } from "@/data/generated/generatedRisks";
import { mockRisks } from "@/data/mock/mockRisks";
import { normalizeRisk } from "./normalize";

const normalized = generatedRisks.map(normalizeRisk);
export const risks = isAssessmentMode() ? normalized : mockRisks;
export const assessmentRisks = generatedRisks;
