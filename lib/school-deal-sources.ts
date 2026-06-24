/**
 * Curated campus deal pages. Fetch these directly when the user's school matches.
 * Add more schools as we learn their official discount/perks URLs.
 */
export interface SchoolDealSource {
  label: string;
  url: string;
}

const SCHOOL_SOURCES: Record<string, SchoolDealSource[]> = {
  berkeley: [
    {
      label: "Student Technology Services - Discounts and Funding",
      url: "https://studenttech.berkeley.edu/techdiscounts",
    },
    {
      label: "University Business Partnerships - Student Perks",
      url: "https://upp.berkeley.edu/student-perks",
    },
  ],
};

function normalizeSchoolKey(school: string): string | null {
  const s = school.toLowerCase().trim();
  if (!s) return null;
  if (s.includes("berkeley") || s.includes("ucb")) return "berkeley";
  return null;
}

export function getKnownSchoolDealSources(school: string): SchoolDealSource[] {
  const key = normalizeSchoolKey(school);
  if (!key) return [];
  return SCHOOL_SOURCES[key] ?? [];
}

export function getSchoolSearchQueries(school: string): string[] {
  const short = school.trim();
  if (!short) return [];

  return [
    `${short} student tech discounts site:edu`,
    `${short} student perks discounts campus`,
    `${short} student technology equity program free software`,
  ];
}
