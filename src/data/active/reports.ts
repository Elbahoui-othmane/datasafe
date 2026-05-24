import { isAssessmentMode } from "@/config/dataSource";
import { generatedReports, isoReadinessReport } from "@/data/generated/generatedReports";
import { mockReports } from "@/data/mock/mockReports";

export const reports = isAssessmentMode() ? generatedReports : mockReports;
export { isoReadinessReport };
