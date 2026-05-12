# Travel Skill — Transit Risk Table
**Version:** 1.0
**Created:** 2026-05-11
**Purpose:** Lookup table baked into the Travel Skill at build time. Not retrieved from Pinecone. Used to detect high-risk transit hubs when a patient selects "Flying" as their travel method.
**Location:** `scripts/cannavec/transit_risk_table.md`
**Used by:** `travel_skill_spec.md` — Transit Intelligence Layer

---

## How This Table Is Used

When a patient selects "Flying" and enters origin/destination, the Skill checks this table:

```
lookup = transit_risk_table[origin_region][destination_region]
if lookup.risk in ["high", "conditional"]:
    show transit_hub_selector = true
    prepend transit_warning to output
```

If the patient confirms their transit hub via the dropdown, the Skill checks the hub against the high-risk country list and generates a specific transit warning for that hub.

If the patient leaves the transit hub blank (direct flight), no transit warning is generated.

---

## Origin Regions

For the purposes of routing inference, countries are grouped into regions. Individual country-level precision is not needed — the routing patterns are regional.

| Region code | Countries |
|---|---|
| `EUR_SCHENGEN` | All Schengen Area members (AT, BE, HR, CZ, DK, EE, FI, FR, DE, GR, HU, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE, IS, LI, NO, CH) |
| `EUR_NON_SCHENGEN` | UK (GB), Ireland (IE) |
| `NORTH_AMERICA` | US, CA |
| `OCEANIA` | AU, NZ |
| `EAST_ASIA` | JP, KR, CN, TW, HK, SG, TH, VN, PH, ID, MY |
| `SOUTH_ASIA` | IN, PK, LK, BD |
| `MIDDLE_EAST` | AE, QA, SA, KW, BH, OM, JO, LB, EG |
| `AFRICA` | ZA, UG, KE, TZ, GH, NG, ET, MA |
| `LATIN_AMERICA` | CO, MX, BR, AR, CL, PE, UY, JM |

---

## Transit Risk Table

### European origins → Long-haul destinations

| Origin region | Destination region | Common transit hubs | Risk level | Warning type |
|---|---|---|---|---|
| `EUR_SCHENGEN` | `OCEANIA` (AU, NZ) | Dubai (DXB/EK), Doha (DOH/QR), Singapore (SIN/SQ), Hong Kong (HKG/CX), Bangkok (BKK/TG) | 🔴 HIGH | Full transit warning — all common hubs are high-risk |
| `EUR_NON_SCHENGEN` | `OCEANIA` (AU, NZ) | Dubai (DXB/EK), Doha (DOH/QR), Singapore (SIN/SQ), Hong Kong (HKG/CX) | 🔴 HIGH | Full transit warning |
| `EUR_SCHENGEN` | `EAST_ASIA` (TH, VN, ID, MY, PH, SG) | Dubai (DXB/EK), Doha (DOH/QR), or direct | 🔴 HIGH | All destination countries are themselves high-risk; transit hubs also high-risk |
| `EUR_SCHENGEN` | `EAST_ASIA` (JP, KR, CN, TW) | Dubai, Doha, or direct | 🟠 MODERATE-HIGH | Destinations are high-risk; some direct routes available |
| `EUR_SCHENGEN` | `AFRICA` (East/West: KE, TZ, NG, ET, GH, UG) | Dubai (DXB/EK), Doha (DOH/QR), Addis Ababa (ET) | 🔴 HIGH | Middle East hubs common; ET is lower risk |
| `EUR_SCHENGEN` | `AFRICA` (ZA) | Dubai (DXB/EK), Doha (DOH/QR), or direct (LH, BA, KL, FR) | ⚠️ CONDITIONAL | Direct routes from major EU hubs available — trigger hub selector |
| `EUR_NON_SCHENGEN` | `AFRICA` (ZA) | Dubai (DXB/EK), Doha (DOH/QR), or direct (BA, KL) | ⚠️ CONDITIONAL | Direct routes available; trigger hub selector |
| `EUR_SCHENGEN` | `SOUTH_ASIA` (IN) | Dubai, Doha, or direct | ⚠️ CONDITIONAL | India has no formal medical cannabis programme; enforce destination warning |
| `EUR_SCHENGEN` | `MIDDLE_EAST` (AE, QA, SA, etc.) | N/A — destination IS high-risk | 🔴 HIGH | Destination warning (not transit warning) |
| `EUR_SCHENGEN` | `LATIN_AMERICA` | Direct (Iberia, Air France, KLM, Lufthansa) or US transit | ⚠️ CONDITIONAL | US transit is a federal issue; some direct routes available |
| `EUR_NON_SCHENGEN` | `LATIN_AMERICA` | Direct (BA, Iberia) or US transit | ⚠️ CONDITIONAL | Trigger hub selector |

### UK and non-Schengen European origins → North America

| Origin | Destination | Common hubs | Risk | Warning type |
|---|---|---|---|---|
| `EUR_NON_SCHENGEN` (UK) | `NORTH_AMERICA` (CA) | Direct (Air Canada, British Airways) | ✅ LOWER | No transit warning; destination warning (CA prohibits import) |
| `EUR_NON_SCHENGEN` (UK) | `NORTH_AMERICA` (US) | Direct or via US hub (JFK, EWR, ORD) | 🔴 HIGH | Destination warning (Schedule I; do not carry) |
| `EUR_SCHENGEN` | `NORTH_AMERICA` (CA) | Direct or via UK (YYZ, YVR, YUL) | ✅ LOWER | No transit warning; destination warning (CA prohibits import) |
| `EUR_SCHENGEN` | `NORTH_AMERICA` (US) | Direct or via UK hub | 🔴 HIGH | Destination warning (Schedule I; do not carry) |

### Intra-European routes

| Origin | Destination | Common hubs | Risk | Warning type |
|---|---|---|---|---|
| `EUR_NON_SCHENGEN` (UK) | `EUR_SCHENGEN` (any) | Direct flights; no Schengen border controls | ✅ LOWER | No transit warning; standard documentation guidance |
| `EUR_SCHENGEN` | `EUR_SCHENGEN` | No border controls | ✅ LOWER | No transit warning; Article 75 certificate guidance |
| `EUR_NON_SCHENGEN` (IE) | `EUR_SCHENGEN` | Direct flights (Dublin to EU) | ✅ LOWER | IE is not Schengen; documentation guidance applies |

### Oceania origins → Europe and beyond

| Origin | Destination | Common hubs | Risk | Warning type |
|---|---|---|---|---|
| `OCEANIA` (AU, NZ) | `EUR_SCHENGEN` or `EUR_NON_SCHENGEN` | Dubai (EK), Doha (QR), Singapore (SQ), Bangkok (TG) | 🔴 HIGH | Full transit warning — outbound from AU/NZ to Europe is equally dangerous |
| `OCEANIA` (AU, NZ) | `NORTH_AMERICA` (CA) | Auckland/Sydney direct, or via US | ✅/⚠️ | CA prohibits import; no transit warning if direct; US transit risk if via US |
| `OCEANIA` (AU) | `OCEANIA` (NZ) | Direct | ✅ LOWER | Trans-Tasman route; verify NZ rules |

---

## High-Risk Transit Hubs — Reference List

These hubs trigger the transit warning regardless of origin/destination:

| Hub | IATA | Country | Risk reason |
|---|---|---|---|
| Dubai International | DXB | 🇦🇪 UAE | Zero tolerance; trace amounts prosecuted; arrests confirmed |
| Abu Dhabi | AUH | 🇦🇪 UAE | Same UAE law applies |
| Hamad International (Doha) | DOH | 🇶🇦 Qatar | Zero tolerance; strict enforcement |
| Singapore Changi | SIN | 🇸🇬 Singapore | Death penalty for trafficking; rigorous screening |
| Hong Kong International | HKG | 🇭🇰 Hong Kong | Zero tolerance; criminal penalties |
| Suvarnabhumi (Bangkok) | BKK | 🇹🇭 Thailand | Destination itself high-risk; re-regulated June 2025 but still strict |
| Kuala Lumpur | KUL | 🇲🇾 Malaysia | Death penalty for trafficking |
| Jakarta | CGK | 🇮🇩 Indonesia | Death penalty for trafficking |
| Manila | MNL | 🇵🇭 Philippines | Severe penalties; high enforcement risk |
| Beijing / Shanghai | PEK/PVG | 🇨🇳 China | Zero tolerance |
| Riyadh / Jeddah | RUH/JED | 🇸🇦 Saudi Arabia | Death penalty for trafficking |
| Kuwait City | KWI | 🇰🇼 Kuwait | Severe penalties |

## Lower-Risk Transit Hubs (no warning triggered)

| Hub | IATA | Country | Notes |
|---|---|---|---|
| Amsterdam Schiphol | AMS | 🇳🇱 Netherlands | Schengen; medical cannabis legal |
| Frankfurt | FRA | 🇩🇪 Germany | Schengen; medical cannabis legal |
| Paris CDG | CDG | 🇫🇷 France | Schengen; check French rules |
| London Heathrow | LHR | 🇬🇧 UK | Schedule 2; documentation applies |
| Madrid Barajas | MAD | 🇪🇸 Spain | Schengen; AEMPS permit required for Spain entry |
| Toronto Pearson | YYZ | 🇨🇦 Canada | CA prohibits import but transit without clearing customs may differ |
| New York JFK | JFK | 🇺🇸 US | Federal law applies at all US ports of entry — flag as ⚠️ |
| Addis Ababa Bole | ADD | 🇪🇹 Ethiopia | Lower risk transit hub; ET has no declared zero-tolerance programme |
| Johannesburg OR Tambo | JNB | 🇿🇦 South Africa | SA decriminalised; lower risk |

---

## Transit Warning Text Templates

### Full transit warning (🔴 HIGH risk hub confirmed)

```
⚠️ TRANSIT WARNING — {hub_city} ({hub_country})

Your route passes through {hub_city}, {hub_country}.
{hub_country} has zero tolerance for cannabis — including prescribed
medical cannabis. Passengers have been arrested at {hub_airport}
for trace amounts of cannabis in their luggage or bloodstream.

Your UK/EU prescription provides no legal protection in {hub_country}.

OPTIONS:
• Fly a different route that avoids {hub_country}
• Do not carry your cannabis and manage your condition
  without it for the duration of travel
• Consult your prescribing doctor before this trip

If you choose to travel via {hub_city} without cannabis,
continue below for guidance on your destination country.
```

### Conditional transit warning (⚠️ route flagged, hub not confirmed)

```
⚠️ CHECK YOUR ROUTE — transit risk possible

Many flights from {origin} to {destination} pass through
the Middle East (UAE, Qatar) or Southeast Asia (Singapore,
Malaysia), where cannabis laws are extremely strict.

Please confirm your transit hub:
[Dropdown — select your connecting airport]

If you have a direct flight, select "Direct — no transit".
```

### No transit warning (✅ lower risk route)

No warning surfaced. Proceed directly to documentation guidance.

---

## Maintenance Notes

This table should be reviewed when:
- A major hub country changes its cannabis laws
- A new long-haul route pattern emerges (e.g. new airline hub opening)
- A patient reports an unexpected transit experience
- Any country on the high-risk list changes its enforcement posture

Review cadence: annually, and whenever `patient_travel_high_risk_countries.md` is updated.

**Last reviewed:** 2026-05-11
