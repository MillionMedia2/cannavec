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
