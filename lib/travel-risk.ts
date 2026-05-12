// Transit risk table — baked into the Travel Skill at build time.
// Source: transit_risk_table.md v1.0 (2026-05-11)
// Do not retrieve from Pinecone — this is routing inference, not knowledge retrieval.

export type RiskLevel = "high" | "conditional" | "lower" | "destination_only";

export type TravelMethod = "flying" | "driving" | "train_ferry";

export type Duration = "up_to_7" | "8_to_30" | "over_30";

export interface Country {
  code: string;
  name: string;
  region: RegionCode;
  isoSchengen: boolean;
}

export type RegionCode =
  | "EUR_SCHENGEN"
  | "EUR_NON_SCHENGEN"
  | "NORTH_AMERICA"
  | "OCEANIA"
  | "EAST_ASIA"
  | "SOUTH_ASIA"
  | "MIDDLE_EAST"
  | "AFRICA"
  | "LATIN_AMERICA";

export interface TransitHub {
  iata: string;
  city: string;
  country: string;
  countryCode: string;
  risk: "high" | "lower";
}

export interface RouteRisk {
  level: RiskLevel;
  warningType: "full_transit" | "conditional_transit" | "destination_only" | "none";
  flaggedHubs: TransitHub[];
  showHubSelector: boolean;
  message: string;
}

// ─── Country registry ──────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [
  // Schengen
  { code: "AT", name: "Austria", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "BE", name: "Belgium", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "HR", name: "Croatia", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "CZ", name: "Czech Republic", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "DK", name: "Denmark", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "EE", name: "Estonia", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "FI", name: "Finland", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "FR", name: "France", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "DE", name: "Germany", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "GR", name: "Greece", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "HU", name: "Hungary", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "IS", name: "Iceland", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "IT", name: "Italy", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "LV", name: "Latvia", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "LI", name: "Liechtenstein", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "LT", name: "Lithuania", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "LU", name: "Luxembourg", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "MT", name: "Malta", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "NL", name: "Netherlands", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "NO", name: "Norway", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "PL", name: "Poland", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "PT", name: "Portugal", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "RO", name: "Romania", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "SK", name: "Slovakia", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "SI", name: "Slovenia", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "ES", name: "Spain", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "SE", name: "Sweden", region: "EUR_SCHENGEN", isoSchengen: true },
  { code: "CH", name: "Switzerland", region: "EUR_SCHENGEN", isoSchengen: true },
  // Non-Schengen European
  { code: "GB", name: "United Kingdom", region: "EUR_NON_SCHENGEN", isoSchengen: false },
  { code: "IE", name: "Ireland", region: "EUR_NON_SCHENGEN", isoSchengen: false },
  // North America
  { code: "US", name: "United States", region: "NORTH_AMERICA", isoSchengen: false },
  { code: "CA", name: "Canada", region: "NORTH_AMERICA", isoSchengen: false },
  // Oceania
  { code: "AU", name: "Australia", region: "OCEANIA", isoSchengen: false },
  { code: "NZ", name: "New Zealand", region: "OCEANIA", isoSchengen: false },
  // East Asia
  { code: "JP", name: "Japan", region: "EAST_ASIA", isoSchengen: false },
  { code: "KR", name: "South Korea", region: "EAST_ASIA", isoSchengen: false },
  { code: "CN", name: "China", region: "EAST_ASIA", isoSchengen: false },
  { code: "TW", name: "Taiwan", region: "EAST_ASIA", isoSchengen: false },
  { code: "HK", name: "Hong Kong", region: "EAST_ASIA", isoSchengen: false },
  { code: "SG", name: "Singapore", region: "EAST_ASIA", isoSchengen: false },
  { code: "TH", name: "Thailand", region: "EAST_ASIA", isoSchengen: false },
  { code: "VN", name: "Vietnam", region: "EAST_ASIA", isoSchengen: false },
  { code: "PH", name: "Philippines", region: "EAST_ASIA", isoSchengen: false },
  { code: "ID", name: "Indonesia", region: "EAST_ASIA", isoSchengen: false },
  { code: "MY", name: "Malaysia", region: "EAST_ASIA", isoSchengen: false },
  // South Asia
  { code: "IN", name: "India", region: "SOUTH_ASIA", isoSchengen: false },
  { code: "PK", name: "Pakistan", region: "SOUTH_ASIA", isoSchengen: false },
  { code: "LK", name: "Sri Lanka", region: "SOUTH_ASIA", isoSchengen: false },
  // Middle East
  { code: "AE", name: "United Arab Emirates", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "QA", name: "Qatar", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "SA", name: "Saudi Arabia", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "KW", name: "Kuwait", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "BH", name: "Bahrain", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "OM", name: "Oman", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "JO", name: "Jordan", region: "MIDDLE_EAST", isoSchengen: false },
  { code: "EG", name: "Egypt", region: "MIDDLE_EAST", isoSchengen: false },
  // Africa
  { code: "ZA", name: "South Africa", region: "AFRICA", isoSchengen: false },
  { code: "KE", name: "Kenya", region: "AFRICA", isoSchengen: false },
  { code: "TZ", name: "Tanzania", region: "AFRICA", isoSchengen: false },
  { code: "UG", name: "Uganda", region: "AFRICA", isoSchengen: false },
  { code: "GH", name: "Ghana", region: "AFRICA", isoSchengen: false },
  { code: "NG", name: "Nigeria", region: "AFRICA", isoSchengen: false },
  { code: "ET", name: "Ethiopia", region: "AFRICA", isoSchengen: false },
  { code: "MA", name: "Morocco", region: "AFRICA", isoSchengen: false },
  // Latin America
  { code: "CO", name: "Colombia", region: "LATIN_AMERICA", isoSchengen: false },
  { code: "MX", name: "Mexico", region: "LATIN_AMERICA", isoSchengen: false },
  { code: "BR", name: "Brazil", region: "LATIN_AMERICA", isoSchengen: false },
  { code: "AR", name: "Argentina", region: "LATIN_AMERICA", isoSchengen: false },
  { code: "CL", name: "Chile", region: "LATIN_AMERICA", isoSchengen: false },
  { code: "UY", name: "Uruguay", region: "LATIN_AMERICA", isoSchengen: false },
  { code: "JM", name: "Jamaica", region: "LATIN_AMERICA", isoSchengen: false },
];

export const COUNTRIES_SORTED = (() => {
  const uk = COUNTRIES.find((c) => c.code === "GB")!;
  const rest = COUNTRIES.filter((c) => c.code !== "GB").sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return [uk, ...rest];
})();

/** Separator index — UK is index 0, the visual gap goes after it */
export const UK_SEPARATOR_INDEX = 0;

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

// ─── High-risk transit hubs ────────────────────────────────────────────────────

export const HIGH_RISK_HUBS: TransitHub[] = [
  { iata: "DXB", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", risk: "high" },
  { iata: "AUH", city: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", risk: "high" },
  { iata: "DOH", city: "Doha", country: "Qatar", countryCode: "QA", risk: "high" },
  { iata: "SIN", city: "Singapore", country: "Singapore", countryCode: "SG", risk: "high" },
  { iata: "HKG", city: "Hong Kong", country: "Hong Kong", countryCode: "HK", risk: "high" },
  { iata: "BKK", city: "Bangkok", country: "Thailand", countryCode: "TH", risk: "high" },
  { iata: "KUL", city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", risk: "high" },
  { iata: "CGK", city: "Jakarta", country: "Indonesia", countryCode: "ID", risk: "high" },
  { iata: "MNL", city: "Manila", country: "Philippines", countryCode: "PH", risk: "high" },
  { iata: "PEK", city: "Beijing", country: "China", countryCode: "CN", risk: "high" },
  { iata: "PVG", city: "Shanghai", country: "China", countryCode: "CN", risk: "high" },
  { iata: "RUH", city: "Riyadh", country: "Saudi Arabia", countryCode: "SA", risk: "high" },
  { iata: "JED", city: "Jeddah", country: "Saudi Arabia", countryCode: "SA", risk: "high" },
  { iata: "KWI", city: "Kuwait City", country: "Kuwait", countryCode: "KW", risk: "high" },
];

export const LOWER_RISK_HUBS: TransitHub[] = [
  { iata: "AMS", city: "Amsterdam", country: "Netherlands", countryCode: "NL", risk: "lower" },
  { iata: "FRA", city: "Frankfurt", country: "Germany", countryCode: "DE", risk: "lower" },
  { iata: "CDG", city: "Paris (CDG)", country: "France", countryCode: "FR", risk: "lower" },
  { iata: "LHR", city: "London (Heathrow)", country: "United Kingdom", countryCode: "GB", risk: "lower" },
  { iata: "MAD", city: "Madrid", country: "Spain", countryCode: "ES", risk: "lower" },
  { iata: "YYZ", city: "Toronto", country: "Canada", countryCode: "CA", risk: "lower" },
  { iata: "ADD", city: "Addis Ababa", country: "Ethiopia", countryCode: "ET", risk: "lower" },
  { iata: "JNB", city: "Johannesburg", country: "South Africa", countryCode: "ZA", risk: "lower" },
];

export const ALL_HUB_OPTIONS: TransitHub[] = [
  { iata: "DIRECT", city: "Direct flight — no transit", country: "", countryCode: "", risk: "lower" },
  ...HIGH_RISK_HUBS,
  ...LOWER_RISK_HUBS,
];

// ─── Route risk logic ──────────────────────────────────────────────────────────

// Middle East destinations are themselves high-risk regardless of transit.
const MIDDLE_EAST_DESTINATION_COUNTRIES = new Set(["AE", "QA", "SA", "KW", "BH", "OM", "JO"]);
// US is Schedule I — do not carry cannabis there.
const DO_NOT_CARRY_DESTINATIONS = new Set(["US"]);
// High-risk East Asian destinations (death penalty / zero tolerance).
const HIGH_RISK_EAST_ASIA = new Set(["SG", "MY", "ID", "PH", "CN", "HK"]);

export function assessRouteRisk(
  originCode: string,
  destinationCode: string,
  travelMethod: TravelMethod
): RouteRisk {
  const origin = getCountry(originCode);
  const destination = getCountry(destinationCode);

  if (!origin || !destination) {
    return {
      level: "lower",
      warningType: "none",
      flaggedHubs: [],
      showHubSelector: false,
      message: "",
    };
  }

  // Same country — no travel risk.
  if (originCode === destinationCode) {
    return {
      level: "lower",
      warningType: "none",
      flaggedHubs: [],
      showHubSelector: false,
      message: "You are travelling within the same country.",
    };
  }

  // Do not carry to US under any circumstances.
  if (DO_NOT_CARRY_DESTINATIONS.has(destinationCode)) {
    return {
      level: "high",
      warningType: "destination_only",
      flaggedHubs: [],
      showHubSelector: false,
      message:
        "Cannabis is a Schedule I substance under US federal law. Do not travel to the United States with cannabis, regardless of your prescription.",
    };
  }

  // Middle East destinations — zero tolerance at the destination.
  if (MIDDLE_EAST_DESTINATION_COUNTRIES.has(destinationCode)) {
    return {
      level: "high",
      warningType: "destination_only",
      flaggedHubs: [],
      showHubSelector: false,
      message: `${destination.name} has zero tolerance for cannabis, including prescribed medical cannabis. Do not travel there with cannabis.`,
    };
  }

  // High-risk East Asian destinations.
  if (HIGH_RISK_EAST_ASIA.has(destinationCode)) {
    return {
      level: "high",
      warningType: "destination_only",
      flaggedHubs: [],
      showHubSelector: false,
      message: `${destination.name} has extremely strict cannabis laws. Do not travel there with cannabis.`,
    };
  }

  // Non-flying routes — no transit hub risk. Assess destination only.
  if (travelMethod !== "flying") {
    const isSchengenToSchengen =
      origin.isoSchengen && destination.isoSchengen;
    const isUKtoSchengen =
      origin.region === "EUR_NON_SCHENGEN" && destination.isoSchengen;

    if (isSchengenToSchengen || isUKtoSchengen) {
      return {
        level: "lower",
        warningType: "none",
        flaggedHubs: [],
        showHubSelector: false,
        message: "",
      };
    }

    return {
      level: "lower",
      warningType: "none",
      flaggedHubs: [],
      showHubSelector: false,
      message: "",
    };
  }

  // ─── Flying routes ────────────────────────────────────────────────────────

  const originRegion = origin.region;
  const destRegion = destination.region;

  // Europe → Oceania: all practical hubs are high-risk.
  if (
    (originRegion === "EUR_SCHENGEN" || originRegion === "EUR_NON_SCHENGEN") &&
    destRegion === "OCEANIA"
  ) {
    return {
      level: "high",
      warningType: "full_transit",
      flaggedHubs: [
        HIGH_RISK_HUBS.find((h) => h.iata === "DXB")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "DOH")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "SIN")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "HKG")!,
      ],
      showHubSelector: true,
      message:
        "Routes from Europe to Australia and New Zealand almost always transit through the UAE, Qatar, Singapore, or Hong Kong — all of which have zero tolerance for cannabis. This is a high-risk route.",
    };
  }

  // Oceania → Europe: equally dangerous in reverse.
  if (
    originRegion === "OCEANIA" &&
    (destRegion === "EUR_SCHENGEN" || destRegion === "EUR_NON_SCHENGEN")
  ) {
    return {
      level: "high",
      warningType: "full_transit",
      flaggedHubs: [
        HIGH_RISK_HUBS.find((h) => h.iata === "DXB")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "DOH")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "SIN")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "HKG")!,
      ],
      showHubSelector: true,
      message:
        "Routes from Australia and New Zealand to Europe almost always transit through the UAE, Qatar, Singapore, or Hong Kong — all of which have zero tolerance for cannabis. This is a high-risk route.",
    };
  }

  // Europe → East/Southeast Asia (flagged destinations already caught above).
  if (
    (originRegion === "EUR_SCHENGEN" || originRegion === "EUR_NON_SCHENGEN") &&
    destRegion === "EAST_ASIA"
  ) {
    return {
      level: "high",
      warningType: "conditional_transit",
      flaggedHubs: [
        HIGH_RISK_HUBS.find((h) => h.iata === "DXB")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "DOH")!,
      ],
      showHubSelector: true,
      message:
        "Many routes from Europe to East Asia transit through the UAE or Qatar. Please confirm your route.",
    };
  }

  // Europe → Africa (conditional — direct routes exist to South Africa).
  if (
    (originRegion === "EUR_SCHENGEN" || originRegion === "EUR_NON_SCHENGEN") &&
    destRegion === "AFRICA"
  ) {
    if (destinationCode === "ZA") {
      return {
        level: "conditional",
        warningType: "conditional_transit",
        flaggedHubs: [
          HIGH_RISK_HUBS.find((h) => h.iata === "DXB")!,
          HIGH_RISK_HUBS.find((h) => h.iata === "DOH")!,
        ],
        showHubSelector: true,
        message:
          "Direct flights to South Africa are available from major European hubs. If you fly via Dubai or Doha, you face high transit risk. Please confirm your route.",
      };
    }
    return {
      level: "high",
      warningType: "conditional_transit",
      flaggedHubs: [
        HIGH_RISK_HUBS.find((h) => h.iata === "DXB")!,
        HIGH_RISK_HUBS.find((h) => h.iata === "DOH")!,
      ],
      showHubSelector: true,
      message:
        "Many routes from Europe to East and West Africa transit through Dubai or Doha. Please confirm your route.",
    };
  }

  // Europe → Latin America (US transit risk on some routes).
  if (
    (originRegion === "EUR_SCHENGEN" || originRegion === "EUR_NON_SCHENGEN") &&
    destRegion === "LATIN_AMERICA"
  ) {
    return {
      level: "conditional",
      warningType: "conditional_transit",
      flaggedHubs: [],
      showHubSelector: true,
      message:
        "Some routes to Latin America transit through the US, where cannabis is a federal offence. Please confirm your route.",
    };
  }

  // UK/Schengen → Canada: direct routes available; CA prohibits import regardless.
  if (
    (originRegion === "EUR_SCHENGEN" || originRegion === "EUR_NON_SCHENGEN") &&
    destinationCode === "CA"
  ) {
    return {
      level: "lower",
      warningType: "destination_only",
      flaggedHubs: [],
      showHubSelector: false,
      message:
        "Canada prohibits importing cannabis across its borders, even with a prescription. You cannot legally bring your cannabis to Canada.",
    };
  }

  // Intra-European: Schengen ↔ Schengen, or UK → Schengen.
  const isSchengenToSchengen =
    origin.isoSchengen && destination.isoSchengen;
  const isUKtoSchengen =
    origin.region === "EUR_NON_SCHENGEN" && destination.isoSchengen;
  const isSchengenToUK =
    origin.isoSchengen && destination.region === "EUR_NON_SCHENGEN";

  if (isSchengenToSchengen || isUKtoSchengen || isSchengenToUK) {
    return {
      level: "lower",
      warningType: "none",
      flaggedHubs: [],
      showHubSelector: false,
      message: "",
    };
  }

  // Oceania ↔ Oceania (AU ↔ NZ trans-Tasman): lower risk, direct.
  if (originRegion === "OCEANIA" && destRegion === "OCEANIA") {
    return {
      level: "lower",
      warningType: "none",
      flaggedHubs: [],
      showHubSelector: false,
      message: "",
    };
  }

  // Default: show hub selector as a precaution.
  return {
    level: "conditional",
    warningType: "conditional_transit",
    flaggedHubs: [],
    showHubSelector: true,
    message:
      "Please confirm your transit hub so we can check for any route-specific risks.",
  };
}

// Check a confirmed transit hub against the high-risk list.
export function assessTransitHub(iata: string): TransitHub | null {
  if (!iata || iata === "DIRECT") return null;
  return HIGH_RISK_HUBS.find((h) => h.iata === iata) ?? null;
}
