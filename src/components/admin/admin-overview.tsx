"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Users,
  DollarSign,
  UserPlus,
  BarChart3,
  Wallet,
  Target,
} from "lucide-react";

type UserLite = {
  id: string;
  name: string | null;
  email: string | null;
  savings: Array<{ amount: number }>;
};

export default function AdminOverview({
  users,
  totalUsers,
  totalSavings,
  allSavings,
  showNewUserDialog,
  setShowNewUserDialog,
  newUser,
  setNewUser,
  loading,
  handleCreateUser,
  setActiveTab,
}: {
  users: UserLite[];
  totalUsers: number;
  totalSavings: number;
  allSavings: Array<{ createdAt: Date }>;
  showNewUserDialog: boolean;
  setShowNewUserDialog: (open: boolean) => void;
  newUser: {
    name: string;
    email: string;
    phone: string;
    goal: any;
    frequency: string;
  };
  setNewUser: (v: any) => void;
  loading: boolean;
  handleCreateUser: (e: React.FormEvent) => Promise<void> | void;
  setActiveTab: (v: string) => void;
}) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active savers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦
              {totalSavings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Platform total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average per User
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦
              {(totalUsers > 0 ? totalSavings / totalUsers : 0).toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per user average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                allSavings.filter(
                  (s: any) =>
                    new Date(s.createdAt).getTime() >
                    Date.now() - 7 * 24 * 60 * 60 * 1000
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Entries this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog
              open={showNewUserDialog}
              onOpenChange={setShowNewUserDialog}
            >
              <DialogTrigger asChild>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  Create New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the savings platform
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Savings Goal (Optional)</Label>
                    <Input
                      id="goal"
                      type="number"
                      step="0.01"
                      value={newUser.goal}
                      onChange={(e) =>
                        setNewUser({ ...newUser, goal: e.target.value })
                      }
                      placeholder="Enter savings goal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency (Optional)</Label>
                    <Select
                      value={newUser.frequency}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Creating..." : "Create User"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewUserDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => setActiveTab("savings")}
            >
              <Wallet className="h-4 w-4 mr-2" /> Add Savings Entry
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Top Savers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Top Savers
            </CardTitle>
            <CardDescription>Users with highest savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users
                .map((user: any) => ({
                  ...user,
                  totalSavings: user.savings.reduce(
                    (sum: number, s: any) => sum + s.amount,
                    0
                  ),
                }))
                .sort((a: any, b: any) => b.totalSavings - a.totalSavings)
                .slice(0, 5)
                .map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {user.name || "No name"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₦
                        {user.totalSavings.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.savings.length} entries
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
