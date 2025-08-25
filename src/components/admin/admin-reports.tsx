"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

type ReportType = "financial" | "activity" | "export";

export default function AdminReports({
  users,
  allSavings,
  totalUsers,
  totalSavings,
  chartData,
  reportType,
  setReportType,
  exportUsersCsv,
  exportSavingsCsv,
}: {
  users: Array<{
    id: string;
    name: string | null;
    email: string | null;
    goal: number | null;
    frequency: string | null;
    savings: Array<{
      amount: number;
      createdAt: Date;
      description: string | null;
    }>;
  }>;
  allSavings: Array<{
    id: string;
    amount: number;
    description: string | null;
    createdAt: Date;
    user: { id: string; name: string | null; email: string | null };
  }>;
  totalUsers: number;
  totalSavings: number;
  chartData: Array<{ month: string; amount: number; count: number }>;
  reportType: ReportType;
  setReportType: (t: ReportType) => void;
  exportUsersCsv: () => void;
  exportSavingsCsv: () => void;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">
            Financial, user activity, and export data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={reportType}
            onValueChange={(value: any) => {
              const v = value as ReportType;
              setReportType(v);
              const params = new URLSearchParams(window.location.search);
              params.set("tab", "reports");
              params.set("type", v);
              window.history.replaceState(null, "", `?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="activity">User Activity</SelectItem>
              <SelectItem value="export">Export Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reportType === "financial" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
              <CardDescription>Overall financial snapshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Savings
                </span>
                <span className="font-semibold">
                  ₦
                  {totalSavings.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Average per User
                </span>
                <span className="font-semibold">
                  ₦
                  {(totalUsers > 0
                    ? totalSavings / totalUsers
                    : 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Users</span>
                <span className="font-semibold">{totalUsers}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>Monthly totals over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: { label: "Amount", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-amount)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Users by Total Savings</CardTitle>
              <CardDescription>
                Top 10 users with highest totals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Total Savings</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Goal Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .map((u: any) => ({
                        ...u,
                        total: u.savings.reduce(
                          (s: number, sv: any) => s + sv.amount,
                          0
                        ),
                      }))
                      .sort((a: any, b: any) => b.total - a.total)
                      .slice(0, 10)
                      .map((u: any) => {
                        const progress = u.goal
                          ? Math.min((u.total / u.goal) * 100, 100)
                          : 0;
                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {u.name || "No name"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {u.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                ₦
                                {u.total.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </TableCell>
                            <TableCell>{u.savings.length}</TableCell>
                            <TableCell>
                              {u.goal ? (
                                <div className="space-y-1">
                                  <Progress value={progress} className="w-24" />
                                  <div className="text-xs text-muted-foreground">
                                    {progress.toFixed(0)}%
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  No goal
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest 25 savings entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSavings
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .slice(0, 25)
                      .map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {s.user.name || "No name"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {s.user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              ₦
                              {s.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            {s.description || (
                              <span className="text-muted-foreground">
                                No description
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {format(new Date(s.createdAt), "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(s.createdAt), "h:mm a")}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
              <CardDescription>
                Users with the most entries in last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Entries (30d)</TableHead>
                      <TableHead>Total Amount (30d)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .map((u) => {
                        const recent = u.savings.filter(
                          (sv) =>
                            new Date(sv.createdAt).getTime() >
                            Date.now() - 30 * 24 * 60 * 60 * 1000
                        );
                        const total = recent.reduce(
                          (s, sv) => s + sv.amount,
                          0
                        );
                        return { u, count: recent.length, total };
                      })
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 10)
                      .map(({ u, count, total }) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {u.name || "No name"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{count}</TableCell>
                          <TableCell>
                            ₦
                            {total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "export" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Users</CardTitle>
              <CardDescription>Download all users as CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportUsersCsv}>Download Users CSV</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Savings</CardTitle>
              <CardDescription>Download all savings as CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportSavingsCsv}>Download Savings CSV</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
