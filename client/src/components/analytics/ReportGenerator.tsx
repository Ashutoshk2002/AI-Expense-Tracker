import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, BarChart3, Loader2 } from "lucide-react";
import { useGenerateReport } from "@/services/report";
import { REPORT_TYPE, type ReportType, type GenerateReportData } from "@/types";

interface ReportGeneratorProps {
  onReportGenerated: (reportId: string) => void;
}

export function ReportGenerator({ onReportGenerated }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>("MONTHLY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const generateMutation = useGenerateReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reportData: GenerateReportData = {
      reportType,
      ...(reportType === "CUSTOM" && {
        customPeriod: {
          start: new Date(startDate).toISOString(),
          end: new Date(endDate).toISOString(),
        },
      }),
    };

    try {
      const response = await generateMutation.mutateAsync(reportData);
      onReportGenerated(response.data.reportId);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  const isCustom = reportType === "CUSTOM";
  const isFormValid = isCustom ? startDate && endDate : true;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Generate Analytics Report</CardTitle>
            <p className="text-sm text-gray-600">
              AI-powered insights from your spending data
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Period</Label>
            <Select
              value={reportType}
              onValueChange={(value: ReportType) => setReportType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REPORT_TYPE.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={REPORT_TYPE.MONTHLY}>Monthly</SelectItem>
                <SelectItem value={REPORT_TYPE.QUARTERLY}>Quarterly</SelectItem>
                <SelectItem value={REPORT_TYPE.YEARLY}>Yearly</SelectItem>
                <SelectItem value={REPORT_TYPE.CUSTOM}>Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {isCustom && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                    min={startDate}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={!isFormValid || generateMutation.isPending}
            className="w-fit bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Analytics Report
              </>
            )}
          </Button>

          {/* Info */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">📊 What you'll get:</p>
            <ul className="text-xs space-y-1">
              <li>• AI-powered spending insights and patterns</li>
              <li>• Budget performance analysis</li>
              <li>• Category breakdown and recommendations</li>
              <li>• Financial health score</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
