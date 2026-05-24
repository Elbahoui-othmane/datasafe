import { risks as mockRisks } from "@/mocks/data";
import { generatedRisks } from "./generatedAssessmentData";

export const assessmentRisks = generatedRisks;
export const risks = [...mockRisks, ...assessmentRisks];
