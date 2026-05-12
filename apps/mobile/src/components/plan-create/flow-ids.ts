/**
 * Stable ids for plan-create steps. Prefer these over matching `eyebrow` copy —
 * eyebrow is display text; `stepId` is routing / footer logic.
 */
export const PLAN_CREATE_STEP_ID = {
	newPlan: "new-plan",
	reading: "reading",
	review: "review",
	created: "created",
} as const;

export type PlanCreateStepId =
	(typeof PLAN_CREATE_STEP_ID)[keyof typeof PLAN_CREATE_STEP_ID];
