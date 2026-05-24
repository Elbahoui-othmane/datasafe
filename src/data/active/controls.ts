import { isAssessmentMode } from "@/config/dataSource";
import { generatedControls } from "@/data/generated/generatedControls";
import { mockControls } from "@/data/mock/mockControls";
import { normalizeControl } from "./normalize";

const normalized = generatedControls.map(normalizeControl);
export const controls = isAssessmentMode() ? normalized : mockControls;
export const assessmentControls = generatedControls;
