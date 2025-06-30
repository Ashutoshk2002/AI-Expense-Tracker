import { useState } from "react";
import {
  DashboardLayout,
  type DashboardTab,
} from "@/components/layout/DashboardLayout";
import { OverviewStats } from "@/components/overview/OverviewStats";
import { RecentExpenses } from "@/components/overview/RecentExpenses";
import { BudgetProgress } from "@/components/overview/BudgetProgress";
import { BudgetsList } from "@/components/budget/BudgetsList";
import { ExpensesList } from "@/components/expense/ExpensesList";
import { ReportGenerator } from "@/components/analytics/ReportGenerator";
import { ReportDisplay } from "@/components/analytics/ReportDisplay";
import { Button } from "@/components/ui/button";

function OverviewTab({
  onTabChange,
}: {
  onTabChange: (tab: DashboardTab) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-600">Your financial summary at a glance</p>
      </div>
      <OverviewStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses onViewAll={() => onTabChange("expenses")} />
        <BudgetProgress onViewAll={() => onTabChange("budgets")} />
      </div>
    </div>
  );
}

function ExpensesTab() {
  return <ExpensesList />;
}

function AnalyticsTab() {
  const [reportId, setReportId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600">
          AI-powered insights and trends from your spending data
        </p>
      </div>

      {!reportId ? (
        <ReportGenerator onReportGenerated={setReportId} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setReportId(null)}
              className="mb-4"
            >
              ← Generate New Report
            </Button>
          </div>
          <ReportDisplay reportId={reportId} />
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onTabChange={setActiveTab} />;
      case "budgets":
        return <BudgetsList />;
      case "expenses":
        return <ExpensesTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <OverviewTab onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
