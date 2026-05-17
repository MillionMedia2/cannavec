export type TierName =
  | "free"
  | "advocacy"
  | "startup"
  | "professional"
  | "enterprise";

export interface SkillContext {
  userId: string;
  tier: string;
  apiKeyId: string;
}

export interface SkillResult {
  text: string;
  structuredContent?: any;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  minTier: TierName;
  /**
   * Whether this skill can be invoked via the MCP endpoint and /api/v1/skills.
   * Set to false for multi-step UI wizards (e.g. Triage, Strain Selector) that
   * don't make sense as one-shot tool calls. UI-only skills can still appear in
   * the dashboard skill catalogue tile array.
   *
   * Defaults to true if omitted, for backwards compatibility with the original
   * skills (searchKb, regulatoryCheck) that pre-date this field.
   */
  mcpEligible?: boolean;
  annotations: {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    openWorldHint: boolean;
  };
  inputSchema: Record<string, any>;
  handler(
    input: Record<string, any>,
    context: SkillContext
  ): Promise<SkillResult>;
}
