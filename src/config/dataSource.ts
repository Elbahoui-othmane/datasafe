export type DataSource = "assessment" | "mock";

export const DATA_SOURCE: DataSource = "assessment";

export function isAssessmentMode(): boolean {
  return DATA_SOURCE === "assessment";
}

export function isMockMode(): boolean {
  return DATA_SOURCE === "mock";
}
