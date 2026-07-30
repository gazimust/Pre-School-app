/**
 * Reference data for England's Early Years Foundation Stage (EYFS) framework.
 * The 7 areas of learning (3 Prime + 4 Specific) and the two age bands used
 * by the current framework: "Birth to Three" and "Three and Four-Year-Olds".
 */

export const EYFS_AREA_SEED = [
  {
    name: "Communication and Language",
    type: "PRIME" as const,
    sortOrder: 1,
    description:
      "Listening, attention and understanding; speaking. Underpins all seven areas of learning.",
  },
  {
    name: "Physical Development",
    type: "PRIME" as const,
    sortOrder: 2,
    description: "Gross motor skills; fine motor skills.",
  },
  {
    name: "Personal, Social and Emotional Development",
    type: "PRIME" as const,
    sortOrder: 3,
    description: "Self-regulation; managing self; building relationships.",
  },
  {
    name: "Literacy",
    type: "SPECIFIC" as const,
    sortOrder: 4,
    description: "Comprehension; word reading; writing.",
  },
  {
    name: "Mathematics",
    type: "SPECIFIC" as const,
    sortOrder: 5,
    description: "Number; numerical patterns.",
  },
  {
    name: "Understanding the World",
    type: "SPECIFIC" as const,
    sortOrder: 6,
    description: "Past and present; people, culture and communities; the natural world.",
  },
  {
    name: "Expressive Arts and Design",
    type: "SPECIFIC" as const,
    sortOrder: 7,
    description: "Creating with materials; being imaginative and expressive.",
  },
];

export const DEVELOPMENT_LEVEL_LABEL: Record<string, string> = {
  EMERGING: "Emerging",
  EXPECTED: "Expected",
  EXCEEDING: "Exceeding",
};

export const DEVELOPMENT_LEVEL_COLOR: Record<string, string> = {
  EMERGING: "bg-amber-100 text-amber-800 border-amber-300",
  EXPECTED: "bg-leaf-100 text-leaf-800 border-leaf-300",
  EXCEEDING: "bg-brand-100 text-brand-800 border-brand-300",
};

export const REPORT_TYPE_LABEL: Record<string, string> = {
  TWO_YEAR_CHECK: "2-Year-Old Progress Check",
  TERMLY_SUMMARY: "Termly Summary Report",
  TRANSITION: "Room Transition Report",
  SCHOOL_READINESS: "School Readiness Report",
};

export const REPORT_TYPE_DESCRIPTION: Record<string, string> = {
  TWO_YEAR_CHECK:
    "The statutory check (required by the EYFS framework) for children aged between two and three, reviewing progress in the three prime areas.",
  TERMLY_SUMMARY:
    "A summary of a child's progress across all seven areas of learning for the current term.",
  TRANSITION:
    "A handover report summarising development and next steps as a child moves to a new room.",
  SCHOOL_READINESS:
    "A summary report for children preparing to move on to school, referencing the Early Learning Goals.",
};
