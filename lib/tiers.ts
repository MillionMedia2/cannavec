export const TIER_NAMESPACES: Record<string, string[]> = {
  free:         ["cannabis", "cannabis_faq", "cannabis_products"],
  vip:          ["cannabis", "cannabis_faq", "cannabis_products"],
  advocacy:     ["cannabis", "cannabis_faq", "cannabis_products"],
  startup:      ["cannabis", "cannabis_faq", "cannabis_products"],
  professional: ["cannabis", "cannabis_faq", "cannabis_products", "natural_remedies"],
  enterprise:   ["cannabis", "cannabis_faq", "cannabis_products", "natural_remedies"],
};

export const PAID_TIERS = ["vip", "advocacy", "startup", "professional", "enterprise"];

export function getAllowedNamespaces(tier: string): string[] {
  return TIER_NAMESPACES[tier] ?? TIER_NAMESPACES.free;
}

export function isNamespaceAllowed(tier: string, namespace: string): boolean {
  return getAllowedNamespaces(tier).includes(namespace);
}

export function hasPaidAccess(tier: string, isAdmin: boolean): boolean {
  return isAdmin || PAID_TIERS.includes(tier);
}
