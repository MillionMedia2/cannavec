import { getSkillsForTier, getSkillById } from "@/lib/skills";
import type { SkillContext, SkillResult } from "@/lib/skills/types";

export function buildToolsForTier(tier: string) {
  return getSkillsForTier(tier).map((skill) => ({
    name: skill.id,
    description: skill.description,
    inputSchema: skill.inputSchema,
    annotations: skill.annotations,
  }));
}

export async function dispatchToolCall(
  toolName: string,
  args: Record<string, any>,
  context: SkillContext
): Promise<SkillResult> {
  const skill = getSkillById(toolName);
  if (!skill) throw new Error(`Unknown tool: ${toolName}`);
  return skill.handler(args, context);
}
