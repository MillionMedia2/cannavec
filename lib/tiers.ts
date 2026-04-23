export const TIER_NAMESPACES: Record<string, string[]> = {
  free:         ["cannabis", "cannabis_faq"],
  advocacy:     ["cannabis", "cannabis_faq"],
  startup:      ["cannabis", "cannabis_faq", "cannabis_products"],
  professional: ["cannabis", "cannabis_faq", "cannabis_products", "natural_remedies"],
  enterprise:   ["cannabis", "cannabis_faq", "cannabis_products", "natural_remedies"],
};

export function getAllowedNamespaces(tier: string): string[] {
  return TIER_NAMESPACES[tier] ?? TIER_NAMESPACES.free;
}

export function isNamespaceAllowed(tier: string, namespace: string): boolean {
  return getAllowedNamespaces(tier).includes(namespace);
}
