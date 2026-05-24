import { controls as mockControls } from "@/mocks/data";
import { generatedControls } from "./generatedAssessmentData";

export const assessmentControls = generatedControls;
export const controls = [...mockControls, ...assessmentControls];
