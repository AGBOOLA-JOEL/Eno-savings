"use client";

import type React from "react";

import { useState, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PiggyBank, Users, DollarSign } from "lucide-react";
import { signOut } from "next-auth/react";
import { format } from "date-fns";

interface AdminDashboardProps {
  users: Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    goal: number | null;
    frequency: string | null;
    savings: Array<{
      id: string;
      amount: number;
      createdAt: Date;
      description: string | null;
    }>;
  }>;
  currentUser: {
    id: string;
    name: string | null;
  };
}

export default function AdminDashboard({
  users,
  currentUser,
}: AdminDashboardProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [savingsSearch, setSavingsSearch] = useState("");

  const totalUsers = users.length;
  const totalSavings = users.reduce(
    (sum, user) =>
      sum +
      user.savings.reduce((userSum, saving) => userSum + saving.amount, 0),
    0
  );

  // Filtered users for summary table
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.trim().toLowerCase();
    return users.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.phone && user.phone.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  // All savings for recent transactions, with user info
  const allSavings = useMemo(
    () =>
      users.flatMap((user) =>
        user.savings.map((saving) => ({ ...saving, user }))
      ),
    [users]
  );

  // Filtered savings for recent transactions
  const filteredSavings = useMemo(() => {
    if (!savingsSearch.trim()) return allSavings;
    const q = savingsSearch.trim().toLowerCase();
    return allSavings.filter(
      (saving) =>
        (saving.description && saving.description.toLowerCase().includes(q)) ||
        saving.amount.toString().includes(q) ||
        (saving.user.name && saving.user.name.toLowerCase().includes(q)) ||
        (saving.user.email && saving.user.email.toLowerCase().includes(q))
    );
  }, [allSavings, savingsSearch]);

  const handleAddSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: Number.parseFloat(amount),
          description: description.trim() || null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Savings entry added successfully.",
        });
        setAmount("");
        setDescription("");
        setSelectedUserId("");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error("Failed to add savings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add savings entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage user savings</p>
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Savings
              </CardTitle>
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
              <p className="text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average per User
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦
                {totalUsers > 0
                  ? (totalSavings / totalUsers).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Per user</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Savings Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Savings Entry</CardTitle>
              <CardDescription>
                Log a new savings entry for a user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSaving} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Select User</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a note about this savings entry"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Savings Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Summary</CardTitle>
              <CardDescription>
                Overview of all users and their savings
              </CardDescription>
              <Input
                placeholder="Search users by name, email, or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Total Savings</TableHead>
                    <TableHead>Entries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const userTotal = user.savings.reduce(
                      (sum, saving) => sum + saving.amount,
                      0
                    );
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.name || "No name"}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          {user.goal != null
                            ? user.goal.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>{user.frequency || "-"}</TableCell>
                        <TableCell>
                          ₦
                          {userTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>{user.savings.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest savings entries across all users
            </CardDescription>
            <Input
              placeholder="Search savings by description, amount, or user..."
              value={savingsSearch}
              onChange={(e) => setSavingsSearch(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent>
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
                {filteredSavings
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 10)
                  .map((saving) => (
                    <TableRow key={saving.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {saving.user.name || "No name"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {saving.user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {saving.user.phone || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        ₦
                        {saving.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{saving.description || "-"}</TableCell>
                      <TableCell>
                        {format(
                          new Date(saving.createdAt),
                          "MMM dd, yyyy h:mm a"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
