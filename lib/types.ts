export type StudentStatus =
  | "high_school"
  | "committed"
  | "deciding"
  | "applying"        // HS senior still in application phase
  | "not_started"
  | "graduated";

export type HousingType = "home" | "dorm" | "off_campus";

export interface CollegeOffer {
  school: string;
  aid_amount?: number;
  estimated_cost?: number;
  letter_text?: string;
}

export interface User {
  id: string;
  name: string;
  school: string;
  location: string;
  major: string;
  monthly_budget: number;
  budget_unknown?: boolean;
  created_at: string;

  // Extended profile
  year_in_school?: string;    // "Freshman" | "Sophomore" | "Junior" | "Senior" | "10th" | "11th" | "12th" | etc.
  student_status?: StudentStatus;
  housing?: HousingType;
  has_meal_plan?: boolean;
  has_car?: boolean;
  college_offers?: CollegeOffer[];
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  emoji?: string;
  monthly_limit: number;
  spent: number;
  color: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  merchant: string;
  category: string;
  source: "voice" | "manual";
  transcript?: string;
  confidence?: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  emoji?: string;
  target_amount: number;
  saved_amount: number;
  deadline: string;
  weekly_savings_required: number;
  status: "active" | "completed" | "paused";
  cost_breakdown?: Record<string, number>;
  priority?: number;
  allocated_monthly?: number;
}

export interface SavingsOpportunity {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  estimated_savings: number;
  claim_status: "not_claimed" | "claimed" | "ignored";
  source_url?: string;
  relevance_tag?: string;
  scope?: "campus" | "general";
}

export interface CourseMaterial {
  id: string;
  title: string;
  edition?: string;
  isbn?: string;
  type: "textbook" | "access_code" | "lab_manual" | "calculator" | "software" | "other";
  required: boolean;
  bookstore_price?: number;
  best_option?: string;
  best_price_range?: string;
  savings_estimate?: number;
  warning?: string;
  options?: CourseOption[];
}

export interface CourseOption {
  label: string;
  price_range: string;
  type: "library" | "rent_used" | "buy_used" | "buy_new" | "oer" | "campus" | "skip";
  pros: string;
  cons?: string;
  recommended?: boolean;
}

export interface CoursePlan {
  id: string;
  course_name: string;
  materials: CourseMaterial[];
  total_bookstore_price: number;
  total_recommended_price: number;
  total_savings: number;
  summary: string;
  created_at: string;
}

export interface ParsedExpense {
  amount: number;
  merchant: string;
  category: string;
  confidence: number;
  needs_confirmation: boolean;
  user_facing_summary: string;
}

export interface PurchaseCheck {
  item: string;
  estimated_amount: number;
  category: string;
  verdict: "yes" | "yes_but" | "wait";
  budget_status: string;
  goal_impact?: string;
  goal_delay_days?: number;
  savings_opportunities: string[];
  recommendation: string;
}

export interface BudgetSnapshot {
  user: User;
  monthly_budget: number;
  total_spent: number;
  remaining: number;
  days_left: number;
  categories: BudgetCategory[];
  goals: Goal[];
  savings_opportunities: SavingsOpportunity[];
  recent_transactions: Transaction[];
  ai_nudge?: string;
}
