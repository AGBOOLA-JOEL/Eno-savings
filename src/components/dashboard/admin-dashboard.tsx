"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
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
import {
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  BarChart3,
  UserPlus,
  Wallet,
  Activity,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
    email: string | null;
  };
}

export default function AdminDashboard({
  users: initialUsers,
  currentUser,
}: AdminDashboardProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [savingsSearch, setSavingsSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [reportType, setReportType] = useState<
    "financial" | "activity" | "export"
  >("financial");
  const [editingSaving, setEditingSaving] = useState<null | {
    id: string;
    userId: string;
    amount: number | string;
    description: string | null;
  }>(null);
  const [showEditSavingDialog, setShowEditSavingDialog] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    goal: "",
    frequency: "",
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);

  // Get active tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
    if (tab === "reports") {
      const type = (urlParams.get("type") || "financial") as
        | "financial"
        | "activity"
        | "export";
      setReportType(type);
    }
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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

  const handleUpdateSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSaving) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/savings/${editingSaving.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(String(editingSaving.amount)),
          description: editingSaving.description ?? null,
        }),
      });

      if (response.ok) {
        toast({ title: "Success!", description: "Savings entry updated." });
        setEditingSaving(null);
        setShowEditSavingDialog(false);
        window.location.reload();
      } else {
        throw new Error("Failed to update savings entry");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update savings entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSaving = async (savingId: string) => {
    if (!confirm("Delete this savings entry? This cannot be undone.")) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/savings/${savingId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Savings entry removed." });
        window.location.reload();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete savings entry.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "User created successfully.",
        });
        setNewUser({
          name: "",
          email: "",
          phone: "",
          goal: "",
          frequency: "",
        });
        setShowNewUserDialog(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          ...editingUser,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "User updated successfully.",
        });
        setEditingUser(null);
        setShowEditUserDialog(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "User deleted successfully.",
        });
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data for analytics
  const chartData =
    analytics?.monthlyData?.map((item: any) => ({
      month: format(new Date(item.month), "MMM yyyy"),
      amount: Number(item.total) || 0,
      count: Number(item.count) || 0,
    })) || [];

  // Helpers: CSV export
  const downloadCsv = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportUsersCsv = () => {
    const headers = [
      "id",
      "name",
      "email",
      "phone",
      "goal",
      "frequency",
      "totalSavings",
      "entries",
    ];
    const rows = users.map((u) => {
      const total = u.savings.reduce((s, sv) => s + sv.amount, 0);
      return [
        u.id,
        u.name ?? "",
        u.email ?? "",
        u.phone ?? "",
        u.goal ?? "",
        u.frequency ?? "",
        total,
        u.savings.length,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCsv(`users_${new Date().toISOString()}.csv`, csv);
  };

  const exportSavingsCsv = () => {
    const headers = [
      "id",
      "userId",
      "userName",
      "userEmail",
      "amount",
      "description",
      "createdAt",
    ];
    const rows = allSavings.map((s) => [
      s.id,
      s.user.id,
      s.user.name ?? "",
      s.user.email ?? "",
      s.amount,
      (s.description ?? "").replace(/\n|\r|,/g, " "),
      new Date(s.createdAt).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCsv(`savings_${new Date().toISOString()}.csv`, csv);
  };

  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Admin Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {activeTab === "overview" && "Overview"}
                    {activeTab === "users" && "User Management"}
                    {activeTab === "savings" && "Savings Management"}
                    {activeTab === "analytics" && "Analytics & Reports"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Savings</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList> */}

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Active savers
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Platform total
                    </p>
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
                      {totalUsers > 0
                        ? (totalSavings / totalUsers).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per user average
                    </p>
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
                          (s) =>
                            new Date(s.createdAt).getTime() >
                            Date.now() - 7 * 24 * 60 * 60 * 1000
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entries this week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
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
                          <Plus className="h-4 w-4 mr-2" />
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
                                setNewUser({
                                  ...newUser,
                                  email: e.target.value,
                                })
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
                                setNewUser({
                                  ...newUser,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="goal">
                              Savings Goal (Optional)
                            </Label>
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
                            <Label htmlFor="frequency">
                              Frequency (Optional)
                            </Label>
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
                                <SelectItem value="quarterly">
                                  Quarterly
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={loading}
                              className="flex-1"
                            >
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
                      <Wallet className="h-4 w-4 mr-2" />
                      Add Savings Entry
                    </Button>

                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                      onClick={() => setActiveTab("analytics")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Top Savers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Savers
                    </CardTitle>
                    <CardDescription>
                      Users with highest savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users
                        .map((user) => ({
                          ...user,
                          totalSavings: user.savings.reduce(
                            (sum, saving) => sum + saving.amount,
                            0
                          ),
                        }))
                        .sort((a, b) => b.totalSavings - a.totalSavings)
                        .slice(0, 5)
                        .map((user, index) => (
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
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <p className="text-muted-foreground">
                    Manage all users and their profiles
                  </p>
                </div>
                <Dialog
                  open={showNewUserDialog}
                  onOpenChange={setShowNewUserDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
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
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1"
                        >
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
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Complete list of users and their savings information
                  </CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, or phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Goal</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Total Savings</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const userTotal = user.savings.reduce(
                            (sum, saving) => sum + saving.amount,
                            0
                          );
                          const progressPercentage = user.goal
                            ? Math.min((userTotal / user.goal) * 100, 100)
                            : 0;

                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {user.name || "No name"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.savings.length} entries
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm">{user.email}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.phone || "No phone"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.goal != null
                                  ? `₦${user.goal.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {user.frequency ? (
                                  <Badge variant="secondary">
                                    {user.frequency}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">
                                  ₦
                                  {userTotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.goal ? (
                                  <div className="space-y-1">
                                    <Progress
                                      value={progressPercentage}
                                      className="w-20"
                                    />
                                    <div className="text-xs text-muted-foreground">
                                      {progressPercentage.toFixed(0)}%
                                    </div>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Dialog
                                    open={
                                      showEditUserDialog &&
                                      editingUser?.id === user.id
                                    }
                                    onOpenChange={(open) => {
                                      setShowEditUserDialog(open);
                                      if (!open) setEditingUser(null);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingUser(user)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Edit User</DialogTitle>
                                        <DialogDescription>
                                          Update user information
                                        </DialogDescription>
                                      </DialogHeader>
                                      {editingUser && (
                                        <form
                                          onSubmit={handleEditUser}
                                          className="space-y-4"
                                        >
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-name">
                                              Full Name
                                            </Label>
                                            <Input
                                              id="edit-name"
                                              value={editingUser.name || ""}
                                              onChange={(e) =>
                                                setEditingUser({
                                                  ...editingUser,
                                                  name: e.target.value,
                                                })
                                              }
                                              placeholder="Enter full name"
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-email">
                                              Email
                                            </Label>
                                            <Input
                                              id="edit-email"
                                              type="email"
                                              value={editingUser.email || ""}
                                              onChange={(e) =>
                                                setEditingUser({
                                                  ...editingUser,
                                                  email: e.target.value,
                                                })
                                              }
                                              placeholder="Enter email address"
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-phone">
                                              Phone
                                            </Label>
                                            <Input
                                              id="edit-phone"
                                              value={editingUser.phone || ""}
                                              onChange={(e) =>
                                                setEditingUser({
                                                  ...editingUser,
                                                  phone: e.target.value,
                                                })
                                              }
                                              placeholder="Enter phone number"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-goal">
                                              Savings Goal
                                            </Label>
                                            <Input
                                              id="edit-goal"
                                              type="number"
                                              step="0.01"
                                              value={editingUser.goal || ""}
                                              onChange={(e) =>
                                                setEditingUser({
                                                  ...editingUser,
                                                  goal: e.target.value,
                                                })
                                              }
                                              placeholder="Enter savings goal"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-frequency">
                                              Frequency
                                            </Label>
                                            <Select
                                              value={
                                                editingUser.frequency || ""
                                              }
                                              onValueChange={(value) =>
                                                setEditingUser({
                                                  ...editingUser,
                                                  frequency: value,
                                                })
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="daily">
                                                  Daily
                                                </SelectItem>
                                                <SelectItem value="weekly">
                                                  Weekly
                                                </SelectItem>
                                                <SelectItem value="monthly">
                                                  Monthly
                                                </SelectItem>
                                                <SelectItem value="quarterly">
                                                  Quarterly
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              type="submit"
                                              disabled={loading}
                                              className="flex-1"
                                            >
                                              {loading
                                                ? "Updating..."
                                                : "Update User"}
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                setShowEditUserDialog(false);
                                                setEditingUser(null);
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </form>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Savings Tab */}
            <TabsContent value="savings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Savings Management</h2>
                <p className="text-muted-foreground">
                  Add and manage savings entries for users
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Savings Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Savings Entry
                    </CardTitle>
                    <CardDescription>
                      Log a new savings entry for any user
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
                                <div className="flex flex-col">
                                  <span>{user.name || user.email}</span>
                                  {user.name && (
                                    <span className="text-xs text-muted-foreground">
                                      {user.email}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₦)</Label>
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
                        <Label htmlFor="description">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add a note about this savings entry"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "Adding..." : "Add Savings Entry"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Recent Savings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest savings entries across all users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allSavings
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .slice(0, 5)
                        .map((saving) => (
                          <div
                            key={saving.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {saving.user.name || "No name"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {saving.description || "No description"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(saving.createdAt),
                                  "MMM dd, yyyy"
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                +₦
                                {saving.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* All Savings Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Savings Entries</CardTitle>
                  <CardDescription>
                    Complete history of all savings entries
                  </CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search savings by description, amount, or user..."
                      value={savingsSearch}
                      onChange={(e) => setSavingsSearch(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
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
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSavings
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          )
                          .slice(0, 50)
                          .map((saving) => (
                            <TableRow key={saving.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">
                                    {saving.user.name || "No name"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {saving.user.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-green-600">
                                  ₦
                                  {saving.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </TableCell>
                              <TableCell>
                                {saving.description || (
                                  <span className="text-muted-foreground">
                                    No description
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">
                                    {format(
                                      new Date(saving.createdAt),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(saving.createdAt),
                                      "h:mm a"
                                    )}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Dialog
                                    open={
                                      showEditSavingDialog &&
                                      editingSaving?.id === saving.id
                                    }
                                    onOpenChange={(open) => {
                                      setShowEditSavingDialog(open);
                                      if (!open) setEditingSaving(null);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setEditingSaving({
                                            id: saving.id,
                                            userId: saving.user.id,
                                            amount: saving.amount,
                                            description: saving.description,
                                          })
                                        }
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Edit Savings Entry
                                        </DialogTitle>
                                        <DialogDescription>
                                          Update amount or description
                                        </DialogDescription>
                                      </DialogHeader>
                                      {editingSaving && (
                                        <form
                                          onSubmit={handleUpdateSaving}
                                          className="space-y-4"
                                        >
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-amount">
                                              Amount (₦)
                                            </Label>
                                            <Input
                                              id="edit-amount"
                                              type="number"
                                              step="0.01"
                                              value={editingSaving.amount}
                                              onChange={(e) =>
                                                setEditingSaving({
                                                  ...editingSaving,
                                                  amount: e.target.value,
                                                })
                                              }
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-description">
                                              Description
                                            </Label>
                                            <Textarea
                                              id="edit-description"
                                              value={
                                                editingSaving.description || ""
                                              }
                                              onChange={(e) =>
                                                setEditingSaving({
                                                  ...editingSaving,
                                                  description: e.target.value,
                                                })
                                              }
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              type="submit"
                                              disabled={loading}
                                            >
                                              {loading
                                                ? "Updating..."
                                                : "Update"}
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                setShowEditSavingDialog(false);
                                                setEditingSaving(null);
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </form>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteSaving(saving.id)
                                    }
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Analytics & Insights</h2>
                <p className="text-muted-foreground">
                  Detailed analytics and performance metrics
                </p>
              </div>

              {analyticsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-8 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Enhanced Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics?.totalUsers || totalUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Active savers on platform
                        </p>
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
                          {(
                            analytics?.totalSavings || totalSavings
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total platform savings
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Recent Savings
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ₦
                          {(analytics?.recentSavings || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
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
                          {(
                            analytics?.averagePerUser ||
                            (totalUsers > 0 ? totalSavings / totalUsers : 0)
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Per user average
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Savings Trend</CardTitle>
                        <CardDescription>
                          Monthly savings growth over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            amount: {
                              label: "Amount",
                              color: "hsl(var(--chart-1))",
                            },
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

                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Entries</CardTitle>
                        <CardDescription>
                          Number of savings entries per month
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            count: {
                              label: "Entries",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                          className="h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="count" fill="var(--color-count)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Savers Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performers</CardTitle>
                      <CardDescription>
                        Users with highest savings and most consistent activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Total Savings</TableHead>
                            <TableHead>Entries</TableHead>
                            <TableHead>Goal Progress</TableHead>
                            <TableHead>Frequency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users
                            .map((user) => ({
                              ...user,
                              totalSavings: user.savings.reduce(
                                (sum, saving) => sum + saving.amount,
                                0
                              ),
                            }))
                            .sort((a, b) => b.totalSavings - a.totalSavings)
                            .slice(0, 10)
                            .map((user, index) => {
                              const progressPercentage = user.goal
                                ? Math.min(
                                    (user.totalSavings / user.goal) * 100,
                                    100
                                  )
                                : 0;

                              return (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                      {index + 1}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">
                                        {user.name || "No name"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {user.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-semibold text-green-600">
                                      ₦
                                      {user.totalSavings.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                    </span>
                                  </TableCell>
                                  <TableCell>{user.savings.length}</TableCell>
                                  <TableCell>
                                    {user.goal ? (
                                      <div className="space-y-1">
                                        <Progress
                                          value={progressPercentage}
                                          className="w-20"
                                        />
                                        <div className="text-xs text-muted-foreground">
                                          {progressPercentage.toFixed(0)}%
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        No goal
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {user.frequency ? (
                                      <Badge variant="secondary">
                                        {user.frequency}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        Not set
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
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
                      setReportType(value);
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.set("tab", "reports");
                      params.set("type", value);
                      window.history.replaceState(
                        null,
                        "",
                        `?${params.toString()}`
                      );
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
                      <CardDescription>
                        Overall financial snapshot
                      </CardDescription>
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
                        <span className="text-sm text-muted-foreground">
                          Users
                        </span>
                        <span className="font-semibold">{totalUsers}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Trend</CardTitle>
                      <CardDescription>
                        Monthly totals over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          amount: {
                            label: "Amount",
                            color: "hsl(var(--chart-1))",
                          },
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
                      <Table>
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
                            .map((u) => ({
                              ...u,
                              total: u.savings.reduce(
                                (s, sv) => s + sv.amount,
                                0
                              ),
                            }))
                            .sort((a, b) => b.total - a.total)
                            .slice(0, 10)
                            .map((u) => {
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
                                        <Progress
                                          value={progress}
                                          className="w-24"
                                        />
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
                    </CardContent>
                  </Card>
                </div>
              )}

              {reportType === "activity" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Latest 25 savings entries
                      </CardDescription>
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
                                        {format(
                                          new Date(s.createdAt),
                                          "MMM dd, yyyy"
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(
                                          new Date(s.createdAt),
                                          "h:mm a"
                                        )}
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
                      <Table>
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
                    </CardContent>
                  </Card>
                </div>
              )}

              {reportType === "export" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Users</CardTitle>
                      <CardDescription>
                        Download all users as CSV
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={exportUsersCsv}>
                        Download Users CSV
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Export Savings</CardTitle>
                      <CardDescription>
                        Download all savings as CSV
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={exportSavingsCsv}>
                        Download Savings CSV
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
