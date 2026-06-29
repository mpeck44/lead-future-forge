// Shared K-12 role options. Keep in sync with profiles.role values.
export const ROLE_OPTIONS = [
  { value: "superintendent", label: "Superintendent" },
  { value: "principal", label: "Principal" },
  { value: "assistant_principal", label: "Assistant Principal" },
  { value: "curriculum_director", label: "Curriculum Director" },
  { value: "technology_director", label: "Technology Director" },
  { value: "teacher_leader", label: "Teacher Leader" },
  { value: "other", label: "Other" },
] as const;

export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

export const AUDIT_CATEGORY_OPTIONS = [
  { value: "fluency", label: "Fluency — AI literacy & tool skills" },
  { value: "strategy", label: "Strategy — vision, plans, roadmap" },
  { value: "action", label: "Action — pilots, execution, change" },
  { value: "governance", label: "Governance — policy, compliance, ethics" },
  { value: "capacity", label: "Capacity — staffing, time, structures" },
] as const;

export type AuditCategoryValue = (typeof AUDIT_CATEGORY_OPTIONS)[number]["value"];
