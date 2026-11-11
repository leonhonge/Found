export type FrontDeskBuilding = {
  name: string;
  address: string;
};

export const UMICH_FRONT_DESK_BUILDINGS: FrontDeskBuilding[] = [
  { name: "Alice Lloyd Hall", address: "100 Observatory St" },
  { name: "Baits Housing", address: "1440 Hubbard Rd" },
  { name: "Betsy Barbour House", address: "420 State St" },
  { name: "Bursley Hall", address: "1931 Duffield St" },
  { name: "Couzens Hall", address: "1300 Ann St" },
  { name: "East Quadrangle", address: "701 University Ave" },
  { name: "Martha Cook Building", address: "906 N University Ave" },
  { name: "Mary Markley Hall", address: "1503 Washington Heights" },
  { name: "Mosher-Jordan Hall", address: "200 Observatory St" },
  { name: "North Quadrangle", address: "105 State St" },
  { name: "Oxford Housing", address: "627 Oxford Rd" },
  { name: "South Quadrangle", address: "600 Madison St" },
  { name: "Stockwell Hall", address: "324 Observatory St" },
  { name: "West Quadrangle", address: "541 Thompson St" },
  { name: "Munger Graduate Residences", address: "540 Thompson St" },
  { name: "Lawyers Club", address: "551 State St" },
  { name: "Wolverine Village", address: "355 E Hoover Ave" },
  { name: "Northwood Community Center", address: "1000 McIntyre Dr" },
  { name: "Michigan Union", address: "530 State St" },
  { name: "Michigan League", address: "911 N University Ave" },
  { name: "Pierpont Commons", address: "2101 Bonisteel Blvd" },
  { name: "Student Activities Building", address: "515 Jefferson St" },
  { name: "Duderstadt Center", address: "2281 Bonisteel Blvd" },
  { name: "University Health Service", address: "207 Fletcher St" },
  { name: "Intramural Sports Building", address: "606 Hoover Ave" },
  { name: "North Campus Recreation Building", address: "2375 Hubbard Rd" },
  { name: "Shapiro Undergraduate Library", address: "919 S University Ave" },
  { name: "Hatcher Graduate Library", address: "913 S University Ave" },
  { name: "Hadley Family Recreation & Well-Being Center", address: "401 Washtenaw Ave" },
];

function normalizeStreet(value: string): string {
  return value
    .toUpperCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\bNORTH\b/g, "N")
    .replace(/\bSOUTH\b/g, "S")
    .replace(/\bEAST\b/g, "E")
    .replace(/\bWEST\b/g, "W")
    .replace(/\bSTREET\b/g, "ST")
    .replace(/\bAVENUE\b/g, "AVE")
    .replace(/\bBOULEVARD\b/g, "BLVD")
    .replace(/\bDRIVE\b/g, "DR")
    .replace(/\bROAD\b/g, "RD")
    .replace(/\bPARKWAY\b/g, "PKWY")
    .replace(/\bHEIGHTS\b/g, "HTS")
    .replace(/\bPLACE\b/g, "PL")
    .trim();
}

function addressKey(value: string): string {
  return normalizeStreet(value)
    .replace(/^(\d+)\s+[NSEW]\s+/, "$1 ")
    .replace(/\s+(ST|AVE|BLVD|DR|RD|PKWY|HTS|PL)$/, "");
}

function nameKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchFrontDeskBuilding(place: {
  name?: string | null;
  streetNumber?: string | null;
  street?: string | null;
  formattedAddress?: string | null;
}): FrontDeskBuilding | null {
  const placeName = place.name ? nameKey(place.name) : "";
  const pulledStreet = [place.streetNumber, place.street].filter(Boolean).join(" ");
  const pulledKey = pulledStreet ? addressKey(pulledStreet) : "";
  const formattedKey = place.formattedAddress ? addressKey(place.formattedAddress) : "";

  for (const building of UMICH_FRONT_DESK_BUILDINGS) {
    const buildingName = nameKey(building.name);
    if (
      placeName &&
      buildingName.length >= 5 &&
      (placeName === buildingName || placeName.includes(buildingName))
    ) {
      return building;
    }

    const buildingKey = addressKey(building.address);
    if (pulledKey && pulledKey === buildingKey) {
      return building;
    }
    if (formattedKey && formattedKey.startsWith(buildingKey)) {
      return building;
    }
  }

  return null;
}
