// API Response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors: null | string[];
}

// Category types
export interface Category {
  category_id: string;
  name: string;
  icon: string;
}

// Budget types
export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface Budget {
  budget_id: string;
  user_id: string;
  category_id: string;
  name: string;
  amount_limit: string;
  current_spent: string;
  budget_period: BudgetPeriod;
  period_start: string;
  period_end: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  progress_percentage?: number;
  remaining_amount?: number;
  days_remaining?: number;
}

export interface CreateBudgetData {
  category_id?: string; // Optional in backend but we'll make it required in UI
  name: string;
  amount_limit: number;
  budget_period: BudgetPeriod;
  period_start: string;
  is_active?: boolean;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  budget_id: string;
}

// Expense types
export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "UPI"
  | "CHEQUE"
  | "WALLET"
  | "OTHER";
export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ExpenseLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Expense {
  expense_id: string;
  user_id: string;
  category_id: string;
  amount: string; // API returns as string "450.50"
  currency: string;
  description: string;
  merchant_name: string;
  expense_date: string;
  payment_method: PaymentMethod;
  location: ExpenseLocation;
  notes: string;
  ai_confidence: number | null;
  is_verified: boolean;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface CreateExpenseData {
  category_id: string;
  amount: number;
  currency?: string;
  description: string;
  merchant_name: string;
  expense_date: string;
  payment_method: PaymentMethod;
  location: ExpenseLocation;
  notes?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  expense_id: string;
}

// Report types
export const REPORT_TYPE = Object.freeze({
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
  CUSTOM: "CUSTOM",
} as const);

export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];

export interface CustomPeriod {
  start: string;
  end: string;
}

export interface GenerateReportData {
  reportType: ReportType;
  customPeriod?: CustomPeriod;
}

export interface GenerateReportResponse {
  reportId: string;
}

// Report data structures
export interface ReportExpense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  merchantName: string;
  paymentMethod: string;
}

export interface BudgetAnalysisItem {
  limit: number;
  spent: number;
  status: string;
  budgetId: string;
  remaining: number;
  budgetName: string;
  categoryId: string;
  percentage: number;
  categoryName: string;
}

export interface FinancialHealth {
  score: number;
  budgetPerformance: {
    totalBudgets: number;
    goodBudgetCount: number;
    overBudgetCount: number;
    warningBudgetCount: number;
  };
}

export interface SpendingDay {
  date: string;
  amount: number;
  dayName: string;
}

export interface DayOfWeekItem {
  day: string;
  amount: number;
}

export interface SpendingPatterns {
  peakSpendingDays: SpendingDay[];
  dayOfWeekAnalysis: {
    breakdown: DayOfWeekItem[];
    topSpendingDay: string;
    topSpendingAmount: number;
  };
  totalSpendingDays: number;
  averageSpendingPerDay: number;
}

export interface CategoryBreakdownItem {
  count: number;
  total: number;
  percentage: number;
}

export interface PaymentMethodBreakdownItem {
  count: number;
  total: number;
}

export interface StructuredAnalysis {
  period: {
    start: string;
    end: string;
  };
  summary: {
    periodDays: number;
    totalExpenses: number;
    totalTransactions: number;
    averageDailySpending: number;
    averageTransactionAmount: number;
  };
  expenses: ReportExpense[];
  dailySpending: Record<string, number>;
  budgetAnalysis: BudgetAnalysisItem[];
  financialHealth: FinancialHealth;
  spendingPatterns: SpendingPatterns;
  categoryBreakdown: Record<string, CategoryBreakdownItem>;
  topSpendingCategories: Array<CategoryBreakdownItem & { name: string }>;
  paymentMethodBreakdown: Record<string, PaymentMethodBreakdownItem>;
}

export interface AIInsights {
  strengths: string[];
  budgetAlert: string | null;
  keyInsights: string[];
  improvements: string[];
  recommendations: {
    immediate: string[];
    longTerm: string[];
  };
  spendingBehavior: string;
}

export interface Report {
  report_id: string;
  user_id: string;
  report_type: ReportType;
  title: string;
  period_start: string;
  period_end: string;
  total_expenses: string;
  total_transactions: number;
  report_data: unknown;
  structured_analysis: StructuredAnalysis;
  ai_insights: AIInsights;
  status: string;
  email_sent: boolean;
  email_sent_at: string;
  createdAt: string;
  updatedAt: string;
  user: {
    user_id: string;
    email: string;
    name: string;
  };
}
