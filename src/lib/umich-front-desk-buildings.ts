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
  { name: "Hadley Family Recreation & Well-Being Center", address: "401 Washtenaw Ave" },
  { name: "Intramural Sports Building", address: "606 Hoover Ave" },
  { name: "North Campus Recreation Building", address: "2375 Hubbard Rd" },
  { name: "Shapiro Undergraduate Library", address: "919 S University Ave" },
  { name: "Hatcher Graduate Library", address: "913 S University Ave" },
];

export function matchFrontDeskBuilding(place: {
  streetNumber?: string | null;
  street?: string | null;
}): FrontDeskBuilding | undefined {
  const address = [place.streetNumber, place.street].filter(Boolean).join(" ");
  return UMICH_FRONT_DESK_BUILDINGS.find(
    (building) => building.address.toLowerCase() === address.toLowerCase(),
  );
}
