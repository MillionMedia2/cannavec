import { searchKb } from "./search_kb";
import { regulatoryCheck } from "./regulatory_check";
import type { Skill } from "./types";

export const ALL_SKILLS: Skill[] = [searchKb, regulatoryCheck];

const TIER_RANK: Record<string, number> = {
  free: 0,
  advocacy: 1,
  startup: 2,
  professional: 3,
  enterprise: 4,
};

export function getSkillsForTier(tier: string): Skill[] {
  const rank = TIER_RANK[tier] ?? 0;
  return ALL_SKILLS.filter((s) => (TIER_RANK[s.minTier] ?? 0) <= rank);
}

export function getSkillById(id: string): Skill | undefined {
  return ALL_SKILLS.find((s) => s.id === id);
}
