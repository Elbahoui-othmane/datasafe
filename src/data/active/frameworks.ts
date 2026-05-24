import { isAssessmentMode } from "@/config/dataSource";
import { generatedFrameworks, isoAssessmentReadiness } from "@/data/generated/generatedFrameworks";
import { mockFrameworks } from "@/data/mock/mockFrameworks";

export const frameworks = isAssessmentMode() ? generatedFrameworks : mockFrameworks;
export { isoAssessmentReadiness };
