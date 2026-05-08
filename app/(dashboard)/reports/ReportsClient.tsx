"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { FinancialMetrics, MonthlyData, Transaction } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CATEGORY_COLORS = [
  "#3C366B", "#00D9C0", "#6b5b95", "#10b981",
  "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6",
];

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleString("default", { month: "short" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CurrencyTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E1E1E1] bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface ReportsClientProps {
  metrics: FinancialMetrics;
  monthly: MonthlyData[];
  byCategory: Array<{ category: string; total: number; count: number }>;
  transactions: Transaction[];
}

export function ReportsClient({
  metrics,
  monthly,
  byCategory,
}: ReportsClientProps) {
  const chartData = monthly.map((d) => ({
    month: formatMonth(d.month),
    Revenue: d.revenue,
    Expenses: d.expenses,
    "Net Cash Flow": d.net,
  }));

  const pieData = byCategory.slice(0, 8).map((c, i) => ({
    name: c.category,
    value: c.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  // Runway health gauge data
  const runwayMonths = metrics.runway ?? 0;
  const runwayColor =
    runwayMonths >= 12
      ? "#10b981"
      : runwayMonths >= 6
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="space-y-6">
      {/* KPI Summary — horizontal stat strip */}
      <div className="rounded-xl border border-[#E1E1E1] bg-white overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E1E1E1] divide-y lg:divide-y-0">
          {[
            {
              label: "Total Revenue",
              value: formatCurrency(metrics.totalRevenue),
              sub: "all time",
              color: "text-green-600",
            },
            {
              label: "Total Expenses",
              value: formatCurrency(metrics.totalExpenses),
              sub: "all time",
              color: "text-red-500",
            },
            {
              label: "Monthly Burn",
              value: formatCurrency(metrics.burnRate),
              sub: "6-month avg",
              color: "text-orange-500",
            },
            {
              label: "Runway",
              value: metrics.runway !== null ? `${metrics.runway} mo` : "N/A",
              sub: "at current burn",
              color: runwayColor,
            },
          ].map((kpi) => (
            <div key={kpi.label} className="px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{kpi.label}</p>
              <p className={`text-xl font-semibold tabular-nums ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="cashflow">
        <TabsList>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        {/* Cash Flow Chart */}
        <TabsContent value="cashflow">
          <Card elevated>
            <CardHeader>
              <CardTitle>Monthly Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
                  No transaction data to display
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9C0" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00D9C0" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E1E1" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#00D9C0"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#colorExpenses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Bar Chart */}
        <TabsContent value="expenses">
          <Card elevated>
            <CardHeader>
              <CardTitle>Monthly Expenses vs Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
                  No data to display
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E1E1" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#00D9C0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Expenses" fill="#3C366B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card elevated>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
                    No categorized transactions
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card elevated>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#E1E1E1]">
                  {byCategory.slice(0, 8).map((cat, i) => {
                    const pct =
                      metrics.totalExpenses > 0
                        ? (cat.total / metrics.totalExpenses) * 100
                        : 0;
                    return (
                      <div key={cat.category} className="flex items-center gap-3 px-5 py-3">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        <span className="flex-1 text-sm text-gray-700 truncate">
                          {cat.category}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, pct)}%`,
                                backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-20 text-right">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {byCategory.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                      No categorized transactions yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
