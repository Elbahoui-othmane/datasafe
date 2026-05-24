/**
 * Verification script for the ISO 27001 Assessment Engine integration.
 * Run with: npx vite-node src/lib/assessment/__tests__/verify.ts
 * Or check build output.
 *
 * This is compiled and typechecked as part of the regular build.
 * NoTestsPage since all verification is inline.
 */

import { assessmentDomains, defaultAssessmentSector } from "@/data/assessmentDomains";
import {
  assessmentDashboardData,
  generatedControls,
  generatedGaps,
  generatedRisks,
  generatedTasks,
  isoReadinessReport,
  assessmentDomainSummaries,
  toDashboardControl,
  toDashboardGap,
  toDashboardRisk,
  toDashboardTask,
} from "@/data/generatedAssessmentData";
import { transformDomainToControls, getQuestionsForSector } from "@/lib/assessment/transform";
import { calculateControlScore, getControlStatus } from "@/lib/assessment/scoring";
import type { AssessmentAnswer, EvidenceStatus } from "@/lib/assessment/types";
import { controls } from "@/data/controls";
import { gaps } from "@/data/gaps";
import { risks } from "@/data/risks";
import { tasks } from "@/data/tasks";
import { frameworks } from "@/data/frameworks";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function assertEq<T>(actual: T, expected: T, label: string) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertGt(actual: number, expected: number, label: string) {
  if (actual > expected) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label} — expected > ${expected}, got ${actual}`);
  }
}

function assertIn<T>(actual: T, list: T[], label: string) {
  if (list.includes(actual)) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label} — ${JSON.stringify(actual)} not in [${list.join(", ")}]`);
  }
}

console.log("\n=== SECTION 1: RAW ASSESSMENT FILES ===");
assert(assessmentDomains.length === 9, `Expected 9 domains, got ${assessmentDomains.length}`);
assessmentDomains.forEach((domain) => {
  assert(!!domain.domain.id, `Domain ${domain.domain.id} has an id`);
  assert(Array.isArray(domain.coreQuestions), `${domain.domain.id}.coreQuestions is an array`);
  assert(domain.coreQuestions.length === 6, `${domain.domain.id} has 6 core questions (got ${domain.coreQuestions.length})`);
  assert(!!domain.sectorQuestions, `${domain.domain.id} has sectorQuestions`);
  assert(domain.selectionLogic?.expectedQuestionCountPerCompany === 9, `${domain.domain.id} selectionLogic expects 9 questions`);
});

console.log("\n=== SECTION 2: SELECTED QUESTIONS COUNT ===");
let totalControls = 0;
assessmentDomains.forEach((domain) => {
  const questions = getQuestionsForSector(domain, "saas");
  assert(questions.length === 9, `${domain.domain.id} has 9 questions for SaaS (got ${questions.length})`);
  totalControls += questions.length;
});
assertEq(totalControls, 81, `Total SaaS controls = 81 (got ${totalControls})`);

console.log("\n=== SECTION 3: TRANSFORMATION TO CONTROLS ===");
const allControls = assessmentDashboardData.controls;
assertEq(allControls.length, 81, `Dashboard data has 81 controls (got ${allControls.length})`);

const REQUIRED_FIELDS = [
  "id", "controlCode", "title", "question", "description",
  "domainId", "domainName", "frameworkId", "frameworkName",
  "category", "owner", "severity", "riskLevel", "weight",
  "source", "appliesTo", "expectedEvidence", "evidenceRequirements",
  "answerOptions", "answer", "status", "evidenceStatus", "score",
  "linkedGaps", "linkedRisks", "linkedTasks",
];

allControls.forEach((control) => {
  REQUIRED_FIELDS.forEach((field) => {
    assert(field in control, `Control ${control.id} has field ${field}`);
  });
  assertEq(control.frameworkId, "iso-27001", `Control ${control.id} frameworkId is iso-27001`);
  assertEq(control.frameworkName, "ISO 27001:2022", `Control ${control.id} frameworkName is ISO 27001:2022`);
  assert(control.id.length > 0, `Control ${control.id} has non-empty id`);
  assert(control.title.length > 0, `Control ${control.id} has non-empty title`);
  assert(control.owner.length > 0, `Control ${control.id} has non-empty owner`);
  assert(Array.isArray(control.answerOptions), `Control ${control.id} has answerOptions array`);
  assert(control.answerOptions.length >= 5, `Control ${control.id} has >= 5 answer options`);
  assert(Array.isArray(control.expectedEvidence), `Control ${control.id} expectedEvidence is array`);
  assert(Array.isArray(control.evidenceRequirements), `Control ${control.id} evidenceRequirements is array`);
});

// Verify severity mapping
assertIn(allControls[0].severity, ["Critical", "High", "Medium", "Low"], "Severity is valid");
assertIn(allControls[0].riskLevel, ["Critical", "High", "Medium", "Low"], "RiskLevel is valid");

// Verify frameworkId consistency
const isoControls = allControls.filter((c) => c.frameworkId === "iso-27001");
assertEq(isoControls.length, 81, "All 81 controls have frameworkId iso-27001");

console.log("\n=== SECTION 4: SCORING LOGIC ===");
// Example 1: implemented + verified = 100, OK
const score1 = calculateControlScore("implemented", "verified", "High", 1.0);
const status1 = getControlStatus(score1);
assertEq(score1, 100, `Score for implemented+verified = 100 (got ${score1})`);
assertEq(status1, "OK", `Status for 100 = OK (got ${status1})`);

// Example 2: mostly_implemented + uploaded = 76.5 -> rounded?
const score2 = calculateControlScore("mostly_implemented", "uploaded", "High", 1.0);
assert(score2 === 76 || score2 === 77, `Score for mostly_implemented+uploaded ~= 76-77 (got ${score2})`);
assertEq(getControlStatus(score2), "Needs attention", `Status for 76 = Needs attention`);

// Example 3: partially_implemented + partial = 50
const score3 = calculateControlScore("partially_implemented", "partial", "Medium", 1.0);
assertEq(score3, 50, `Score for partial+partial = 50 (got ${score3})`);

// Example 4: planned + missing = 17.5
const score4 = calculateControlScore("planned", "missing", "Medium", 1.0) ?? 0;
assert(Math.abs(score4 - 17.5) < 1, `Score for planned+missing ~= 17.5 (got ${score4})`);

// Example 5: not_implemented + missing + critical = 0, Failed
const score5 = calculateControlScore("not_implemented", "missing", "Critical", 1.0);
assertEq(score5, 0, `Score for not_implemented+cricital = 0 (got ${score5})`);
assertEq(getControlStatus(0, "Critical", "not_implemented"), "Failed", `Status for critical not_implemented = Failed`);

console.log("\n=== SECTION 5: EVIDENCE REQUIREMENTS ===");
allControls.forEach((control) => {
  control.evidenceRequirements.forEach((ev) => {
    assert(!!ev.id, `Evidence ${ev.name} has an id`);
    assert(!!ev.name, `Evidence has a name`);
    assert(typeof ev.required === "boolean", `Evidence ${ev.id}.required is boolean`);
    assertIn(ev.type, ["diagram", "inventory", "register", "policy", "contract", "screenshot", "configuration_export", "meeting_notes", "document", "other"], `Evidence type ${ev.type} is valid`);
  });
});

// Evidence status aggregate check
const controlWithEv = allControls[0];
assertIn(controlWithEv.evidenceStatus, ["verified", "uploaded", "partial", "missing"], `Evidence status is one of valid values`);

console.log("\n=== SECTION 6: GENERATED GAPS ===");
assert(generatedGaps.length > 0, `Generated ${generatedGaps.length} gaps`);
generatedGaps.forEach((gap) => {
  assert(!!gap.id, `Gap ${gap.id} has an id`);
  assert(!!gap.title, `Gap ${gap.id} has a title`);
  assert(!!gap.controlId, `Gap ${gap.id} has controlId`);
  assert(!!gap.owner, `Gap ${gap.id} has owner`);
  assert(!!gap.dueDate, `Gap ${gap.id} has dueDate`);
  assert(!!gap.reason, `Gap ${gap.id} has reason`);
  assert(!!gap.nextAction, `Gap ${gap.id} has nextAction`);
  assert(Array.isArray(gap.requiredEvidence), `Gap ${gap.id} has requiredEvidence array`);
  assertIn(gap.status, ["Open", "In remediation", "Awaiting evidence", "Closed"], `Gap status ${gap.status} is valid`);
  assertIn(gap.severity, ["Critical", "High", "Medium", "Low"], `Gap severity ${gap.severity} is valid`);

  // Verify gap links to a valid control
  const linkedControl = allControls.find((c) => c.id === gap.controlId);
  assert(!!linkedControl, `Gap ${gap.id} links to existing control ${gap.controlId}`);
});

// Gap logic: OK controls should not generate critical gaps
allControls.forEach((control) => {
  if (control.status === "OK" && control.score !== null && control.score >= 85) {
    const relatedGaps = generatedGaps.filter((g) => g.controlId === control.id);
    relatedGaps.forEach((gap) => {
      assert(gap.status !== "Open", `OK control ${control.id} gap ${gap.id} has Open status`);
    });
  }
});

console.log("\n=== SECTION 7: GENERATED RISKS ===");
assert(generatedRisks.length > 0, `Generated ${generatedRisks.length} risks`);
generatedRisks.forEach((risk) => {
  assert(!!risk.id, `Risk ${risk.id} has an id`);
  assert(!!risk.title, `Risk ${risk.id} has a title`);
  assert(!!risk.linkedControlId, `Risk ${risk.id} has linkedControlId`);
  assert(!!risk.owner, `Risk ${risk.id} has owner`);
  assert(!!risk.reason, `Risk ${risk.id} has reason`);
  assert(!!risk.treatment, `Risk ${risk.id} has treatment`);
  assertIn(risk.severity, ["Critical", "High", "Medium", "Low"], `Risk severity valid`);
  assertIn(risk.status, ["Identified", "In treatment", "Monitoring", "Accepted"], `Risk status valid`);

  // Verify risk links to a valid control
  const linkedControl = allControls.find((c) => c.id === risk.linkedControlId);
  assert(!!linkedControl, `Risk ${risk.id} links to existing control ${risk.linkedControlId}`);
});

// Check critical risks from critical not_implemented
allControls.forEach((control) => {
  if (control.severity === "Critical" && control.answer === "not_implemented") {
    const relatedRisks = generatedRisks.filter((r) => r.linkedControlId === control.id);
    assert(relatedRisks.length > 0, `Critical not_implemented control ${control.id} generates a risk`);
  }
});

console.log("\n=== SECTION 8: GENERATED TASKS ===");
assert(generatedTasks.length > 0, `Generated ${generatedTasks.length} tasks`);
generatedTasks.forEach((task) => {
  assert(!!task.id, `Task ${task.id} has an id`);
  assert(!!task.title, `Task ${task.id} has a title`);
  assert(!!task.linkedControlId, `Task ${task.id} has linkedControlId`);
  assert(!!task.owner, `Task ${task.id} has owner`);
  assert(!!task.dueDate, `Task ${task.id} has dueDate`);
  assert(Array.isArray(task.checklist), `Task ${task.id} has checklist array`);
  assert(task.checklist.length > 0, `Task ${task.id} has non-empty checklist`);
  assertIn(task.status, ["Open", "In progress", "Awaiting evidence", "Closed"], `Task status "${task.status}" valid`);
  assertIn(task.priority, ["Critical", "High", "Medium", "Low"], `Task priority valid`);
  assertEq(task.framework, "ISO 27001", `Task ${task.id} framework is ISO 27001`);

  // Task links to at least gap or risk
  assert(!!task.linkedGapId || !!task.linkedRiskId, `Task ${task.id} has linkedGapId or linkedRiskId`);

  // Task links to valid control
  const linkedControl = allControls.find((c) => c.id === task.linkedControlId);
  assert(!!linkedControl, `Task ${task.id} links to existing control ${task.linkedControlId}`);
});

console.log("\n=== SECTION 9: DASHBOARD INTEGRATION ===");

// Controls page: merged mock + assessment
assertEq(controls.length, 7 + 81, `Controls page has 7 mock + 81 assessment = 88 controls (got ${controls.length})`);

// Gaps page
assert(gaps.length > 0, `Gaps page has gaps`);
gaps.forEach((gap) => {
  assert(!!gap.id, `Dashboard gap ${gap.id} has id`);
  assert(!!gap.title, `Dashboard gap ${gap.id} has title`);
  assert(!!gap.framework, `Dashboard gap ${gap.id} has framework`);
  assert(gap.requiredEvidence.length > 0 || gap.remediationSteps.length > 0, `Dashboard gap ${gap.id} has evidence or steps`);
});

// Risks page
assert(risks.length > 0, `Risks page has risks`);
risks.forEach((risk) => {
  assert(!!risk.id, `Dashboard risk ${risk.id} has id`);
  assert(!!risk.title, `Dashboard risk ${risk.id} has title`);
});

// Tasks page
assert(tasks.length > 0, `Tasks page has tasks`);
tasks.forEach((task) => {
  assert(!!task.id, `Dashboard task ${task.id} has id`);
  assert(!!task.title, `Dashboard task ${task.id} has title`);
});

// Frameworks: ISO 27001 readiness computed from assessment
const isoFramework = frameworks.find((f) => f.id === "iso-27001")!;
assert(!!isoFramework, "ISO 27001 framework exists");
if (isoFramework) {
  assertEq(isoFramework.readiness, isoReadinessReport.readiness, `ISO framework readiness matches report (${isoFramework.readiness}%)`);
  assertEq(isoFramework.completed, isoReadinessReport.controlsCompleted, `ISO completed controls matched`);
}

// Reports
assert(isoReadinessReport.domainScores.length === 9, `Readiness report has 9 domain scores`);
assert(isoReadinessReport.controlsTotal === 81, `Readiness report total controls = 81`);

// Assessment pages available
const domains = assessmentDomainSummaries;
assertEq(domains.length, 9, "Assessment domain summaries covers 9 domains");

console.log("\n=== SECTION 10: LOGICAL CONSISTENCY ===");

// No duplicate IDs
const controlIds = allControls.map((c) => c.id);
const uniqueIds = new Set(controlIds);
assertEq(controlIds.length, uniqueIds.size, "No duplicate control IDs");

const gapIds = generatedGaps.map((g) => g.id);
assertEq(gapIds.length, new Set(gapIds).size, "No duplicate gap IDs");

const riskIds = generatedRisks.map((r) => r.id);
assertEq(riskIds.length, new Set(riskIds).size, "No duplicate risk IDs");

const taskIds = generatedTasks.map((t) => t.id);
assertEq(taskIds.length, new Set(taskIds).size, "No duplicate task IDs");

// Readiness in [0, 100]
assert(isoReadinessReport.readiness >= 0 && isoReadinessReport.readiness <= 100,
  `ISO readiness ${isoReadinessReport.readiness} is in [0, 100]`);

// N/A controls don't reduce readiness
allControls.forEach((control) => {
  if (control.answer === "not_applicable") {
    assertEq(control.score, null, `N/A control ${control.id} has null score`);
  }
});

// No empty titles
allControls.forEach((c) => assert(c.title.length > 0, `Control ${c.id} title not empty`));
generatedGaps.forEach((g) => assert(g.title.length > 0, `Gap ${g.id} title not empty`));
generatedRisks.forEach((r) => assert(r.title.length > 0, `Risk ${r.id} title not empty`));
generatedTasks.forEach((t) => assert(t.title.length > 0, `Task ${t.id} title not empty`));

// All objects have owners
allControls.forEach((c) => assert(c.owner.length > 0, `Control ${c.id} has owner`));
generatedGaps.forEach((g) => assert(g.owner.length > 0, `Gap ${g.id} has owner`));
generatedRisks.forEach((r) => assert(r.owner.length > 0, `Risk ${r.id} has owner`));
generatedTasks.forEach((t) => assert(t.owner.length > 0, `Task ${t.id} has owner`));

// toDashboard* mapping functions work correctly
const dashControl = toDashboardControl(allControls[0]);
assert(!!dashControl, "toDashboardControl returns valid object");
assert(!!dashControl.name, "Dashboard control has name");

const rawGap = assessmentDashboardData.gaps[0];
if (rawGap) {
  const dashGap = toDashboardGap(rawGap);
  assert(!!dashGap, "toDashboardGap returns valid object");
  assert(!!dashGap.title, "Dashboard gap has title");
}

const rawRisk = assessmentDashboardData.risks[0];
if (rawRisk) {
  const dashRisk = toDashboardRisk(rawRisk);
  assert(!!dashRisk, "toDashboardRisk returns valid object");
}

const rawTask = assessmentDashboardData.tasks[0];
if (rawTask) {
  const dashTask = toDashboardTask(rawTask);
  assert(!!dashTask, "toDashboardTask returns valid object");
  assert(Array.isArray(dashTask.checklist), "Dashboard task has checklist");
}

// Check domain-specific transformation
assessmentDomains.forEach((domain) => {
  const dControls = transformDomainToControls(domain, "saas");
  assertEq(dControls.length, 9, `${domain.domain.id} SaaS controls = 9`);
  dControls.forEach((c) => {
    assert(c.appliesTo.includes("saas") || c.appliesTo.includes("all") || c.appliesTo.length === 0,
      `Control ${c.id} appliesTo includes saas`);
  });
});

// Transform with responses works
const testDomain = assessmentDomains[0];
const testResponse = {
  [testDomain.coreQuestions[0].id]: { answer: "implemented" as AssessmentAnswer, evidenceStatus: "verified" as EvidenceStatus },
};
const controlsWithResponse = transformDomainToControls(testDomain, "saas", testResponse);
const respondedControl = controlsWithResponse.find((c) => c.id === testDomain.coreQuestions[0].id);
assert(!!respondedControl, "Transform with responses finds control");
assertEq(respondedControl!.answer, "implemented", "Response answer is reflected in control");

console.log("\n=== FINAL RESULTS ===");
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
if (failed === 0) {
  console.log("  ✓ ALL CHECKS PASSED");
} else {
  console.log(`  ✗ ${failed} CHECKS FAILED`);
}
