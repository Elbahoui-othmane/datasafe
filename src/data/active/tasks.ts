import { isAssessmentMode } from "@/config/dataSource";
import { generatedTasks } from "@/data/generated/generatedTasks";
import { mockTasks } from "@/data/mock/mockTasks";
import { normalizeTask } from "./normalize";

const normalized = generatedTasks.map(normalizeTask);
export const tasks = isAssessmentMode() ? normalized : mockTasks;
export const assessmentTasks = generatedTasks;
