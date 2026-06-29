export type Reviewer = {
  name: string;
  credentials: string;
  title: string;
  affiliations: string[];
  bio: string;
  headshotInitials: string;
  headshotUrl?: string;
  disclosures: string;
};

export const REVIEWERS: Record<string, Reviewer> = {
  "Dr. Aanya Mehta": {
    name: "Dr. Aanya Mehta",
    credentials: "MD (Dermatology)",
    title: "Board-certified dermatologist",
    affiliations: [
      "Consultant, Cosmetic & Medical Dermatology",
      "Faculty reviewer, Evidently methodology v1.0",
    ],
    bio: "Dr. Mehta has spent the last twelve years in clinic seeing patients for acne, rosacea, pigmentation, and post-procedure recovery. She trained in dermatology in Mumbai, holds a fellowship in cosmetic dermatology, and reads the primary literature so readers do not have to. For Evidently she sets the bar on what counts as 'works' — randomised trials over influencer claims, vehicle-controlled comparisons over before-and-afters.",
    headshotInitials: "AM",
    disclosures:
      "No paid relationships with any brand reviewed on this page. Has consulted for academic dermatology programmes; consulting fees are disclosed in the masthead. Reviews are unpaid editorial work; products are sourced at retail.",
  },
};

export const getReviewer = (name: string): Reviewer => {
  const direct = REVIEWERS[name];
  if (direct) return direct;
  const head = name.split(",")[0]?.trim() ?? name;
  if (REVIEWERS[head]) return REVIEWERS[head];
  return {
    name,
    credentials: "",
    title: "Editorial reviewer",
    affiliations: [],
    bio: "",
    headshotInitials: head
      .replace(/^Dr\.?\s*/i, "")
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "—",
    disclosures: "",
  };
};
