import { getMcpSkillsForTier, getSkillById } from "@/lib/skills";
import type { SkillContext, SkillResult } from "@/lib/skills/types";

export function buildToolsForTier(tier: string) {
  return getMcpSkillsForTier(tier).map((skill) => ({
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
  // Defence-in-depth: refuse to dispatch UI-only skills via the MCP/API surface,
  // even if a client somehow knows the skill ID.
  if (skill.mcpEligible === false) {
    throw new Error(
      `Skill '${skill.id}' is a UI wizard and cannot be invoked via the API. ` +
        `Use it at https://cannavec.ai/dashboard/skills/${skill.id} instead.`
    );
  }
  return skill.handler(args, context);
}
