"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PiggyBank, TrendingUp, Target, Trophy } from "lucide-react";
import { FaNairaSign } from "react-icons/fa6";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { signOut } from "next-auth/react";

interface UserDashboardProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    goal: number | null;
    savings: Array<{
      id: string;
      amount: number;
      createdAt: Date;
      description: string | null;
    }>;
  };
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const totalSavings = user.savings.reduce(
    (sum, saving) => sum + saving.amount,
    0
  );
  const goalProgress = user.goal ? (totalSavings / user.goal) * 100 : 0;

  // Prepare chart data
  const chartData = user.savings
    .slice()
    .reverse()
    .reduce((acc, saving, index) => {
      const runningTotal =
        acc.length > 0
          ? acc[acc.length - 1].total + saving.amount
          : saving.amount;
      acc.push({
        date: format(new Date(saving.createdAt), "MMM dd"),
        total: runningTotal,
        amount: saving.amount,
      });
      return acc;
    }, [] as Array<{ date: string; total: number; amount: number }>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.name}
                </h1>
                <p className="text-gray-600">Track your savings progress</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Savings
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <FaNairaSign className="inline-block w-6 h-6 mr-1 align-middle text-[hsl(var(--primary))]" />
                {totalSavings.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.savings.length} deposits made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Goal Progress
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goalProgress.toFixed(1)}%
              </div>
              {user.goal && <Progress value={goalProgress} className="mt-2" />}
              <p className="text-xs text-muted-foreground mt-2">
                {user.goal ? `Goal: #${user.goal.toFixed(2)}` : "No goal set"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Deposit
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <FaNairaSign className="inline-block w-6 h-6 mr-1 align-middle text-[hsl(var(--primary))]" />

                {user.savings.length > 0
                  ? (totalSavings / user.savings.length).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )
                  : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Savings Growth</CardTitle>
                <CardDescription>
                  Your savings progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          `#${value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                          "Total Savings",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: "#2563eb" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No savings data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Savings History</CardTitle>
                <CardDescription>All your savings transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {user.savings.length > 0 ? (
                  <div className="space-y-4">
                    {user.savings.map((saving) => (
                      <div
                        key={saving.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            <FaNairaSign className="inline-block w-6 h-6 mr-1 align-middle text-[hsl(var(--primary))]" />
                            {saving.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          {saving.description && (
                            <p className="text-sm text-gray-600">
                              {saving.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {format(new Date(saving.createdAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(saving.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No savings history yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  See how you rank among all savers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <Trophy className="h-8 w-8 mr-2" />
                  Leaderboard coming soon!
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
