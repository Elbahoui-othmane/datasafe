import { tasks as mockTasks } from "@/mocks/data";
import { generatedTasks } from "./generatedAssessmentData";

export const assessmentTasks = generatedTasks;
export const tasks = [...mockTasks, ...assessmentTasks];
