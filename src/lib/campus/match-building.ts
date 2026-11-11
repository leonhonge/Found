function toTitleCase(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function normalizeStreet(value: string): string {
  const parts = value
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  return parts
    .map((word) => {
      const upper = word.toUpperCase();
      switch (upper) {
        case "NORTH": return "N";
        case "SOUTH": return "S";
        case "EAST": return "E";
        case "WEST": return "W";
        case "STREET": return "St";
        case "AVENUE": return "Ave";
        case "BOULEVARD": return "Blvd";
        case "DRIVE": return "Dr";
        case "ROAD": return "Rd";
        case "PARKWAY": return "Pkwy";
        case "HEIGHTS": return "Hts";
        case "PLACE": return "Pl";
        default:
          if (["N", "S", "E", "W"].includes(upper)) return upper;
          if (["ST", "AVE", "BLVD", "DR", "RD", "PKWY", "HTS", "PL"].includes(upper)) {
            return toTitleCase(upper);
          }
          return toTitleCase(word);
      }
    })
    .join(" ");
}

function addressKey(value: string): string {
  let normalized = normalizeStreet(value);
  
  // Remove common university prefixes (case insensitive)
  normalized = normalized.replace(/^University Of Michigan\s*/i, "");
  
  return normalized;
}

function nameKey(value: string): string {
  const cleaned = value
    .replace(/\([^)]*\)/g, "")
    .replace(/university of michigan/gi, "")
    .replace(/ann arbor/gi, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ");
}

export type PlaceInput = {
  name?: string | null;
  streetNumber?: string | null;
  street?: string | null;
  formattedAddress?: string | null;
};

export function matchBuilding<T extends { name: string; address: string }>(
  place: PlaceInput,
  buildings: T[]
): T | null {
  const pulledStreet = [place.streetNumber, place.street].filter(Boolean).join(" ");
  const pulledKey = pulledStreet ? addressKey(pulledStreet) : "";
  const formattedKey = place.formattedAddress ? addressKey(place.formattedAddress) : "";
  const inputNameKey = place.name ? nameKey(place.name) : "";


  // 1. Try address matching first (more specific)
  for (const b of buildings) {
    const bKey = addressKey(b.address);
    if (!bKey) continue;
    
    const pulledMatch = pulledKey && (pulledKey === bKey || pulledKey.includes(bKey) || bKey.includes(pulledKey));
    const formattedMatch = formattedKey && (formattedKey === bKey || formattedKey.includes(bKey) || bKey.includes(formattedKey));

    if (pulledMatch || formattedMatch) {
      return b;
    }
  }

  // 2. Try name matching if address matching failed
  if (inputNameKey) {
    for (const b of buildings) {
      const bNameKey = nameKey(b.name);
      if (bNameKey && (bNameKey === inputNameKey || bNameKey.includes(inputNameKey) || inputNameKey.includes(bNameKey))) {
        return b;
      }
    }
  }
  return null;
}
