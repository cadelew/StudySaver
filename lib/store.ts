"use client";

import { create } from "zustand";
import type { BudgetSnapshot, Transaction, Goal, SavingsOpportunity, CoursePlan, User, MealPlan, RefundLadder } from "./types";
import { DEMO_SNAPSHOT, buildCategoriesForUser } from "./demo-data";

const USER_STORAGE_KEY = "studysaver_user";
const BUDGET_STORAGE_KEY = "studysaver_budget";
const DEMO_STORAGE_KEY = "studysaver_demo";

/** True when the user chose "Explore with demo data" — show the seeded persona. */
function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function daysLeftInMonth(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(1, end.getDate() - now.getDate());
}

function loadUserFromStorage(): Partial<User> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type PersistedBudget = Pick<
  BudgetSnapshot,
  "total_spent" | "remaining" | "categories" | "recent_transactions" | "goals" | "ai_nudge" | "meal_plan" | "refund_ladder"
>;

function loadBudgetFromStorage(): PersistedBudget | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBudgetToStorage(snapshot: BudgetSnapshot) {
  if (typeof window === "undefined") return;
  const payload: PersistedBudget = {
    total_spent: snapshot.total_spent,
    remaining: snapshot.remaining,
    categories: snapshot.categories,
    recent_transactions: snapshot.recent_transactions,
    goals: snapshot.goals,
    ai_nudge: snapshot.ai_nudge,
    meal_plan: snapshot.meal_plan,
    refund_ladder: snapshot.refund_ladder,
  };
  window.localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(payload));
}

function buildSnapshotFromStorage(): BudgetSnapshot {
  // "Explore with demo data" → the fully seeded persona (Maya).
  if (isDemoMode()) return DEMO_SNAPSHOT;

  const stored = loadUserFromStorage();
  if (!stored || !stored.name) return DEMO_SNAPSHOT;

  const budget = stored.budget_unknown ? 500 : (Number(stored.monthly_budget) || 500);
  const user: User = {
    id: "user-local",
    name: stored.name || "You",
    school: stored.school || "",
    location: stored.location || "",
    major: stored.major || "",
    monthly_budget: budget,
    budget_unknown: stored.budget_unknown,
    year_in_school: stored.year_in_school,
    student_status: stored.student_status,
    housing: stored.housing,
    has_meal_plan: stored.has_meal_plan,
    has_car: stored.has_car,
    college_offers: stored.college_offers,
    created_at: new Date().toISOString(),
  };

  // Real users start clean — no demo goals, transactions, deals, or seeded plans.
  // Categories are still derived from their budget; curated school perks/deals are
  // surfaced on demand from the Deals page.
  const base: BudgetSnapshot = {
    user,
    monthly_budget: budget,
    total_spent: 0,
    remaining: budget,
    days_left: daysLeftInMonth(),
    categories: buildCategoriesForUser(user),
    goals: [],
    savings_opportunities: [],
    recent_transactions: [],
    ai_nudge: undefined,
    meal_plan: undefined,
    refund_ladder: undefined,
  };

  const budgetStored = loadBudgetFromStorage();
  if (!budgetStored) return base;

  return {
    ...base,
    total_spent: budgetStored.total_spent,
    remaining: budget - budgetStored.total_spent,
    categories: budgetStored.categories?.length ? budgetStored.categories : base.categories,
    recent_transactions: budgetStored.recent_transactions ?? [],
    goals: budgetStored.goals ?? [],
    ai_nudge: budgetStored.ai_nudge,
    meal_plan: budgetStored.meal_plan,
    refund_ladder: budgetStored.refund_ladder,
  };
}

interface AppState {
  snapshot: BudgetSnapshot;
  coursePlan: CoursePlan | null;
  savingsApplied: number;
  isDemo: boolean;

  addTransaction: (txn: Omit<Transaction, "id" | "user_id" | "created_at">) => void;
  applyCourseSavings: (savings: number) => void;
  setCoursePlan: (plan: CoursePlan) => void;
  updateSavingsStatus: (id: string, status: SavingsOpportunity["claim_status"]) => void;
  mergeSavingsOpportunities: (opportunities: SavingsOpportunity[]) => void;
  addGoal: (goal: Omit<Goal, "id" | "user_id">) => void;
  reorderGoal: (id: string, direction: "up" | "down") => void;
  setGoalAllocation: (id: string, amount: number) => void;
  autoAllocateGoals: () => void;
  setCategoryLimit: (id: string, amount: number) => void;
  autoAllocateCategories: () => void;
  setAiNudge: (nudge: string) => void;
  setMealPlan: (plan: MealPlan) => void;
  setRefundLadder: (ladder: RefundLadder) => void;
  setUser: (user: Partial<User>) => void;
  hydrateFromStorage: () => void;
}

export const useStore = create<AppState>((set) => ({
  snapshot: DEMO_SNAPSHOT,
  coursePlan: null,
  savingsApplied: 0,
  isDemo: false,

  hydrateFromStorage: () => set({ snapshot: buildSnapshotFromStorage(), isDemo: isDemoMode() }),

  addTransaction: (txn) =>
    set((state) => {
      const newTxn: Transaction = {
        ...txn,
        id: `t-${Date.now()}`,
        user_id: state.snapshot.user.id,
        created_at: new Date().toISOString(),
      };
      const cat = state.snapshot.categories.find(
        (c) => c.name.toLowerCase() === txn.category.toLowerCase()
      );
      const updatedCategories = state.snapshot.categories.map((c) =>
        c.name.toLowerCase() === txn.category.toLowerCase()
          ? { ...c, spent: c.spent + txn.amount }
          : c
      );
      const newSpent = state.snapshot.total_spent + txn.amount;
      const nextSnapshot = {
        ...state.snapshot,
        total_spent: newSpent,
        remaining: state.snapshot.monthly_budget - newSpent,
        categories: updatedCategories,
        recent_transactions: [newTxn, ...state.snapshot.recent_transactions].slice(0, 20),
      };
      saveBudgetToStorage(nextSnapshot);
      return { snapshot: nextSnapshot };
    }),

  applyCourseSavings: (savings) =>
    set((state) => {
      const updatedGoals = state.snapshot.goals.map((g) =>
        g.id === "goal-1"
          ? { ...g, saved_amount: Math.min(g.target_amount, g.saved_amount + savings) }
          : g
      );
      const updatedCategories = state.snapshot.categories.map((c) =>
        c.name === "School Supplies"
          ? { ...c, spent: Math.max(0, c.spent - savings) }
          : c
      );
      return {
        savingsApplied: savings,
        snapshot: {
          ...state.snapshot,
          goals: updatedGoals,
          categories: updatedCategories,
        },
      };
    }),

  setCoursePlan: (plan) => set({ coursePlan: plan }),

  updateSavingsStatus: (id, status) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        savings_opportunities: state.snapshot.savings_opportunities.map((s) =>
          s.id === id ? { ...s, claim_status: status } : s
        ),
      },
    })),

  mergeSavingsOpportunities: (opportunities) =>
    set((state) => {
      const existingNames = new Set(
        state.snapshot.savings_opportunities.map((s) => s.name.toLowerCase())
      );
      const merged = opportunities
        .filter((o) => !existingNames.has(o.name.toLowerCase()))
        .map((o) => ({ ...o, user_id: state.snapshot.user.id }));
      return {
        snapshot: {
          ...state.snapshot,
          savings_opportunities: [...state.snapshot.savings_opportunities, ...merged],
        },
      };
    }),

  addGoal: (goal) =>
    set((state) => {
      const activeGoals = state.snapshot.goals.filter((g) => g.status === "active");
      const maxPriority = activeGoals.reduce((max, g) => Math.max(max, g.priority ?? 0), 0);
      const newGoal: Goal = {
        ...goal,
        id: `goal-${Date.now()}`,
        user_id: state.snapshot.user.id,
        priority: goal.priority ?? maxPriority + 1,
      };
      return {
        snapshot: {
          ...state.snapshot,
          goals: [...state.snapshot.goals, newGoal],
        },
      };
    }),

  reorderGoal: (id, direction) =>
    set((state) => {
      const active = state.snapshot.goals
        .filter((g) => g.status === "active")
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
      const idx = active.findIndex((g) => g.id === id);
      if (idx < 0) return state;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= active.length) return state;

      const updated = active.map((g, i) => {
        if (i === idx) return { ...g, priority: swapIdx + 1 };
        if (i === swapIdx) return { ...g, priority: idx + 1 };
        return { ...g, priority: i + 1 };
      });

      const goalMap = new Map(updated.map((g) => [g.id, g]));
      return {
        snapshot: {
          ...state.snapshot,
          goals: state.snapshot.goals.map((g) => goalMap.get(g.id) ?? g),
        },
      };
    }),

  setGoalAllocation: (id, amount) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        goals: state.snapshot.goals.map((g) =>
          g.id === id ? { ...g, allocated_monthly: Math.max(0, amount) } : g
        ),
      },
    })),

  autoAllocateGoals: () =>
    set((state) => {
      const pool = Math.max(0, state.snapshot.remaining);
      const active = state.snapshot.goals
        .filter((g) => g.status === "active")
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

      if (active.length === 0 || pool === 0) return state;

      const weights = active.map((_, i) => active.length - i);
      const totalWeight = weights.reduce((s, w) => s + w, 0);

      const allocated = new Map<string, number>();
      let assigned = 0;
      active.forEach((g, i) => {
        const isLast = i === active.length - 1;
        const amount = isLast
          ? Math.round((pool - assigned) * 100) / 100
          : Math.round((pool * weights[i]) / totalWeight);
        allocated.set(g.id, amount);
        assigned += amount;
      });

      return {
        snapshot: {
          ...state.snapshot,
          goals: state.snapshot.goals.map((g) =>
            allocated.has(g.id) ? { ...g, allocated_monthly: allocated.get(g.id) } : g
          ),
        },
      };
    }),

  setCategoryLimit: (id, amount) =>
    set((state) => {
      const nextSnapshot = {
        ...state.snapshot,
        categories: state.snapshot.categories.map((c) =>
          c.id === id ? { ...c, monthly_limit: Math.max(0, Math.round(amount)) } : c
        ),
      };
      saveBudgetToStorage(nextSnapshot);
      return { snapshot: nextSnapshot };
    }),

  autoAllocateCategories: () =>
    set((state) => {
      const { categories, monthly_budget } = state.snapshot;
      if (categories.length === 0 || monthly_budget <= 0) return state;

      const totalCurrent = categories.reduce((s, c) => s + c.monthly_limit, 0);
      const weights =
        totalCurrent > 0
          ? categories.map((c) => c.monthly_limit)
          : categories.map(() => 1);
      const totalWeight = weights.reduce((s, w) => s + w, 0);

      let assigned = 0;
      const limits = categories.map((c, i) => {
        const isLast = i === categories.length - 1;
        const amount = isLast
          ? monthly_budget - assigned
          : Math.round((monthly_budget * weights[i]) / totalWeight);
        assigned += amount;
        return { ...c, monthly_limit: Math.max(0, amount) };
      });

      const nextSnapshot = { ...state.snapshot, categories: limits };
      saveBudgetToStorage(nextSnapshot);
      return { snapshot: nextSnapshot };
    }),

  setAiNudge: (nudge) =>
    set((state) => ({
      snapshot: { ...state.snapshot, ai_nudge: nudge },
    })),

  setMealPlan: (plan) =>
    set((state) => {
      const nextSnapshot = { ...state.snapshot, meal_plan: plan };
      saveBudgetToStorage(nextSnapshot);
      return { snapshot: nextSnapshot };
    }),

  setRefundLadder: (ladder) =>
    set((state) => {
      const nextSnapshot = { ...state.snapshot, refund_ladder: ladder };
      saveBudgetToStorage(nextSnapshot);
      return { snapshot: nextSnapshot };
    }),

  setUser: (user) =>
    set((state) => {
      const merged = { ...state.snapshot.user, ...user };
      const budget = merged.budget_unknown ? 500 : (merged.monthly_budget || 500);
      const categories = buildCategoriesForUser(merged);
      return {
        snapshot: {
          ...state.snapshot,
          user: merged,
          monthly_budget: budget,
          remaining: budget - state.snapshot.total_spent,
          categories,
        },
      };
    }),
}));
