import type { BudgetSnapshot, BudgetCategory, CoursePlan, SavingsOpportunity, User } from "./types";

/**
 * Generate sensible default category limits based on the user's profile.
 * Housing type and meal plan affect how much goes to food vs. groceries.
 */
export function buildCategoriesForUser(user: Partial<User>): BudgetCategory[] {
  const budget = user.budget_unknown ? 500 : (user.monthly_budget || 500);
  const hasMealPlan = user.has_meal_plan ?? false;
  const userId = user.id || "user-local";

  const eatingOut = hasMealPlan ? Math.round(budget * 0.10) : Math.round(budget * 0.22);
  const groceries = hasMealPlan ? Math.round(budget * 0.08) : Math.round(budget * 0.18);
  const transport = user.has_car ? Math.round(budget * 0.18) : Math.round(budget * 0.10);

  return [
    { id: "1", user_id: userId, name: "Eating Out",      monthly_limit: eatingOut,              spent: 0, color: "#9A5B3F" },
    { id: "2", user_id: userId, name: "Groceries",       monthly_limit: groceries,               spent: 0, color: "#4F8A6B" },
    { id: "3", user_id: userId, name: "Transportation",  monthly_limit: transport,               spent: 0, color: "#3E6E7C" },
    { id: "4", user_id: userId, name: "Entertainment",   monthly_limit: Math.round(budget * 0.14), spent: 0, color: "#6B5B9A" },
    { id: "5", user_id: userId, name: "School Supplies", monthly_limit: Math.round(budget * 0.14), spent: 0, color: "#9A7B33" },
    { id: "6", user_id: userId, name: "Subscriptions",   monthly_limit: Math.round(budget * 0.07), spent: 0, color: "#A85A5A" },
    { id: "7", user_id: userId, name: "Miscellaneous",   monthly_limit: Math.round(budget * 0.07), spent: 0, color: "#5B6660" },
  ];
}

export const DEMO_SNAPSHOT: BudgetSnapshot = {
  user: {
    id: "maya-demo",
    name: "Maya",
    school: "UC Berkeley",
    location: "Berkeley, CA",
    major: "Biology",
    monthly_budget: 500,
    created_at: "2026-06-01T00:00:00Z",
  },
  monthly_budget: 500,
  total_spent: 114,
  remaining: 386,
  days_left: 7,
  categories: [
    { id: "1", user_id: "maya-demo", name: "Eating Out", monthly_limit: 120, spent: 34, color: "#9A5B3F" },
    { id: "2", user_id: "maya-demo", name: "Groceries", monthly_limit: 100, spent: 42, color: "#4F8A6B" },
    { id: "3", user_id: "maya-demo", name: "Transportation", monthly_limit: 60, spent: 18, color: "#3E6E7C" },
    { id: "4", user_id: "maya-demo", name: "Entertainment", monthly_limit: 80, spent: 10, color: "#6B5B9A" },
    { id: "5", user_id: "maya-demo", name: "School Supplies", monthly_limit: 80, spent: 0, color: "#9A7B33" },
    { id: "6", user_id: "maya-demo", name: "Subscriptions", monthly_limit: 40, spent: 10, color: "#A85A5A" },
    { id: "7", user_id: "maya-demo", name: "Miscellaneous", monthly_limit: 20, spent: 0, color: "#5B6660" },
  ],
  goals: [
    {
      id: "goal-1",
      user_id: "maya-demo",
      name: "Oakland Concert",
      target_amount: 235,
      saved_amount: 40,
      deadline: "2026-08-15",
      weekly_savings_required: 39.17,
      status: "active",
      priority: 1,
      allocated_monthly: 80,
      cost_breakdown: { ticket: 150, fees: 35, transportation: 25, food_buffer: 25 },
    },
  ],
  savings_opportunities: [
    {
      id: "s-campus-1", user_id: "maya-demo", name: "CDW-G Student Discount (Berkeley)", category: "Campus",
      description: "Discounted Apple, Lenovo, HP hardware with @berkeley.edu. Supports Student Technology Equity Program.",
      estimated_savings: 200, claim_status: "not_claimed",
      source_url: "https://studenttech.berkeley.edu/techdiscounts",
      relevance_tag: "UC Berkeley", scope: "campus",
    },
    {
      id: "s-campus-2", user_id: "maya-demo", name: "ConnexUC Student Travel", category: "Campus",
      description: "UC system travel discounts on airlines, hotels, and car rentals via ConnexUC portal.",
      estimated_savings: 150, claim_status: "not_claimed",
      source_url: "https://upp.berkeley.edu/student-perks",
      relevance_tag: "UC Berkeley", scope: "campus",
    },
    {
      id: "s-campus-3", user_id: "maya-demo", name: "Cost of Attendance Computer Adjustment", category: "Campus",
      description: "Apply through Financial Aid for a one-time computer purchase adjustment (every 3 years).",
      estimated_savings: 500, claim_status: "not_claimed",
      source_url: "https://studenttech.berkeley.edu/techdiscounts",
      relevance_tag: "UC Berkeley", scope: "campus",
    },
    {
      id: "s1", user_id: "maya-demo", name: "GitHub Student Developer Pack", category: "Developer Tools",
      description: "Free access to 100+ developer tools, including GitHub Copilot.", estimated_savings: 120,
      claim_status: "not_claimed", source_url: "https://education.github.com", relevance_tag: "All students", scope: "general",
    },
    {
      id: "s2", user_id: "maya-demo", name: "Notion Education Plan", category: "Productivity",
      description: "Full Notion Plus features free with your .edu email.", estimated_savings: 96,
      claim_status: "not_claimed", source_url: "https://www.notion.so/students", relevance_tag: "All students", scope: "general",
    },
    {
      id: "s3", user_id: "maya-demo", name: "Spotify Premium Student", category: "Entertainment",
      description: "50% off Spotify + Hulu bundle. Switch from full price to student plan.", estimated_savings: 60,
      claim_status: "not_claimed", source_url: "https://www.spotify.com/student", relevance_tag: "Entertainment", scope: "general",
    },
    {
      id: "s4", user_id: "maya-demo", name: "Campus Transit Pass", category: "Transportation",
      description: "Your student fees may already cover AC Transit. Check with the ASUC.", estimated_savings: 180,
      claim_status: "not_claimed", relevance_tag: "UC Berkeley", scope: "campus",
    },
    {
      id: "s5", user_id: "maya-demo", name: "Figma Education Plan", category: "Design Tools",
      description: "Figma Professional free for students and educators.", estimated_savings: 144,
      claim_status: "claimed", source_url: "https://www.figma.com/education", relevance_tag: "All students", scope: "general",
    },
  ],
  recent_transactions: [
    { id: "t1", user_id: "maya-demo", amount: 14, merchant: "Chipotle", category: "Eating Out", source: "voice", created_at: "2026-06-23T12:30:00Z" },
    { id: "t2", user_id: "maya-demo", amount: 42, merchant: "Trader Joe's", category: "Groceries", source: "manual", created_at: "2026-06-22T18:00:00Z" },
    { id: "t3", user_id: "maya-demo", amount: 18, merchant: "Uber", category: "Transportation", source: "voice", created_at: "2026-06-21T22:00:00Z" },
    { id: "t4", user_id: "maya-demo", amount: 10, merchant: "Spotify", category: "Subscriptions", source: "manual", created_at: "2026-06-20T00:00:00Z" },
    { id: "t5", user_id: "maya-demo", amount: 20, merchant: "AMC Theaters", category: "Entertainment", source: "manual", created_at: "2026-06-19T20:00:00Z" },
    { id: "t6", user_id: "maya-demo", amount: 10, merchant: "Peet's Coffee", category: "Eating Out", source: "voice", created_at: "2026-06-19T08:00:00Z" },
  ],
  ai_nudge: "Your eating out is trending 15% high. Cooking twice this week could save enough for concert tickets.",
};

export const DEMO_BIO_COURSE_PLAN: CoursePlan = {
  id: "course-bio-1a",
  course_name: "Biology 1A - Molecular Biology",
  total_bookstore_price: 385,
  total_recommended_price: 89,
  total_savings: 296,
  summary: "Buy only the Mastering Biology access code new ($89). It includes a free digital textbook. Skip the optional study guide until after midterms. Check the library for the lab manual on course reserve (free). Estimated total savings: $296.",
  created_at: "2026-06-23T12:00:00Z",
  materials: [
    {
      id: "m1",
      title: "Campbell Biology",
      edition: "12th",
      isbn: "9780135188743",
      type: "textbook",
      required: true,
      bookstore_price: 220,
      best_option: "Digital included with Mastering Biology",
      best_price_range: "$0 (bundled)",
      savings_estimate: 220,
      options: [
        { label: "Library Course Reserve", price_range: "$0", type: "library", pros: "Free", cons: "2-hour limit, shared", recommended: false },
        { label: "Rent Used (Chegg)", price_range: "$35–$55", type: "rent_used", pros: "Cheap, physical", cons: "Condition varies" },
        { label: "Digital via Mastering", price_range: "$0 (bundled)", type: "buy_new", pros: "Included when you buy access code", cons: "Digital only", recommended: true },
        { label: "Buy New (Bookstore)", price_range: "$220", type: "buy_new", pros: "Physical", cons: "Very expensive" },
      ],
    },
    {
      id: "m2",
      title: "Mastering Biology Access Code",
      type: "access_code",
      required: true,
      bookstore_price: 120,
      best_option: "Buy new. Includes digital textbook",
      best_price_range: "$89",
      savings_estimate: 31,
      warning: "Used copies will not work. Access codes are single-use.",
      options: [
        { label: "Buy New (Pearson)", price_range: "$89", type: "buy_new", pros: "Includes digital textbook, cheaper than bookstore", cons: "One-time use", recommended: true },
        { label: "Buy New (Bookstore)", price_range: "$120", type: "buy_new", pros: "Convenient", cons: "Overpriced vs. publisher direct" },
      ],
    },
    {
      id: "m3",
      title: "Biology 1A Lab Manual",
      type: "lab_manual",
      required: true,
      bookstore_price: 35,
      best_option: "Library course reserve",
      best_price_range: "$0–$8",
      savings_estimate: 27,
      options: [
        { label: "Library Course Reserve", price_range: "$0", type: "library", pros: "Free, check if it's on reserve first", cons: "Shared copy", recommended: true },
        { label: "Buy Used (Campus FB)", price_range: "$8–$15", type: "buy_used", pros: "Own copy", cons: "May have highlights" },
        { label: "Buy New (Bookstore)", price_range: "$35", type: "buy_new", pros: "Clean copy", cons: "Overpriced" },
      ],
    },
    {
      id: "m4",
      title: "Student Study Guide for Campbell Biology",
      type: "other",
      required: false,
      bookstore_price: 10,
      best_option: "Skip until after first midterm",
      best_price_range: "$0",
      savings_estimate: 10,
      warning: "Optional. Most students don't need this if Mastering Biology is active.",
      options: [
        { label: "Skip for now", price_range: "$0", type: "skip", pros: "Save money, optional item", cons: "None if you have Mastering", recommended: true },
        { label: "Buy Used", price_range: "$5–$8", type: "buy_used", pros: "Cheap", cons: "Probably unnecessary" },
      ],
    },
  ],
};

export const TOTAL_YEARLY_SAVINGS = 312;

export const WEEKLY_SPEND_TREND = [
  { label: "Mon", value: 18 },
  { label: "Tue", value: 32 },
  { label: "Wed", value: 14 },
  { label: "Thu", value: 41 },
  { label: "Fri", value: 22 },
  { label: "Sat", value: 9 },
  { label: "Sun", value: 6.5 },
];

export const WEEKLY_SPEND_TOTAL = 142.5;

export const FINANCIAL_HEALTH = {
  score: 8.5,
  label: "On Track",
  insight: "Your dining spend is 7% less than last week. Keep it up to hit your concert goal early.",
};
