// AI Equity Audit question bank. Hardcoded by design — edits ship with the app.
// Categories must match the CHECK constraint on public.audit_responses.category.

export type AuditCategory =
  | "fluency"
  | "strategy"
  | "action"
  | "governance"
  | "capacity";

export interface AuditItem {
  key: string;
  category: AuditCategory;
  prompt: string;
}

export interface CategoryMeta {
  key: AuditCategory;
  label: string;
  subtitle: string;
}

export const AUDIT_CATEGORIES: CategoryMeta[] = [
  {
    key: "fluency",
    label: "Fluency",
    subtitle: "A working understanding of AI across your district",
  },
  {
    key: "strategy",
    label: "Strategy",
    subtitle: "Vision, alignment, and prioritization",
  },
  {
    key: "action",
    label: "Action",
    subtitle: "Implementation discipline and follow-through",
  },
  {
    key: "governance",
    label: "Governance",
    subtitle: "Policy, oversight, and defensibility",
  },
  {
    key: "capacity",
    label: "Capacity",
    subtitle: "People, time, and ongoing support",
  },
];

export const SCALE_LABELS: { value: 1 | 2 | 3 | 4; label: string; helper: string }[] = [
  { value: 1, label: "Not yet", helper: "We haven't started this." },
  { value: 2, label: "Emerging", helper: "Early efforts, inconsistent." },
  { value: 3, label: "Established", helper: "In place, mostly working." },
  { value: 4, label: "Embedded", helper: "Routine practice across the district." },
];

export const AUDIT_ITEMS: AuditItem[] = [
  // Fluency
  {
    key: "fluency_types",
    category: "fluency",
    prompt:
      "Leaders in our district can describe the difference between generative, predictive, and assistive AI.",
  },
  {
    key: "fluency_tools",
    category: "fluency",
    prompt:
      "Staff can name at least three approved AI tools and what each is used for.",
  },
  {
    key: "fluency_families",
    category: "fluency",
    prompt:
      "We have a shared vocabulary for talking about AI risks and benefits with students and families.",
  },

  // Strategy
  {
    key: "strategy_vision",
    category: "strategy",
    prompt:
      "We have a written AI vision tied directly to our strategic plan.",
  },
  {
    key: "strategy_priorities",
    category: "strategy",
    prompt:
      "AI initiatives are prioritized against measurable student outcomes, not novelty.",
  },
  {
    key: "strategy_cabinet",
    category: "strategy",
    prompt:
      "Cabinet reviews AI direction and progress at least once a quarter.",
  },

  // Action
  {
    key: "action_adoption",
    category: "action",
    prompt:
      "New AI tools follow a documented adoption process before reaching classrooms.",
  },
  {
    key: "action_pilots",
    category: "action",
    prompt:
      "Pilots have defined success criteria and a clear sunset date.",
  },
  {
    key: "action_usage",
    category: "action",
    prompt:
      "We track which AI tools are actually being used, by whom, and how often.",
  },

  // Governance
  {
    key: "governance_aup",
    category: "governance",
    prompt:
      "We have an approved AI Acceptable Use Policy covering both staff and students.",
  },
  {
    key: "governance_privacy",
    category: "governance",
    prompt:
      "Data privacy review happens before any AI tool is approved for use.",
  },
  {
    key: "governance_audit",
    category: "governance",
    prompt:
      "We can produce a clear audit trail of AI decisions for the board or community.",
  },

  // Capacity
  {
    key: "capacity_time",
    category: "capacity",
    prompt:
      "Staff have protected time to learn and practice with approved AI tools.",
  },
  {
    key: "capacity_leads",
    category: "capacity",
    prompt:
      "We have at least one identified AI lead per building or department.",
  },
  {
    key: "capacity_followup",
    category: "capacity",
    prompt:
      "Coaching and follow-up exist beyond one-time PD sessions.",
  },
];

export const TOTAL_AUDIT_ITEMS = AUDIT_ITEMS.length;
