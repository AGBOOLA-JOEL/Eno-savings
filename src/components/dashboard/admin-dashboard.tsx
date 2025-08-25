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
import AdminOverview from "@/components/admin/admin-overview";
import AdminUsers from "@/components/admin/admin-users";
import AdminSavings from "@/components/admin/admin-savings";
import AdminAnalytics from "@/components/admin/admin-analytics";
import AdminReports from "@/components/admin/admin-reports";

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
              <AdminOverview
                users={users}
                totalUsers={totalUsers}
                totalSavings={totalSavings}
                allSavings={allSavings}
                showNewUserDialog={showNewUserDialog}
                setShowNewUserDialog={setShowNewUserDialog}
                newUser={newUser}
                setNewUser={setNewUser}
                loading={loading}
                handleCreateUser={handleCreateUser}
                setActiveTab={setActiveTab}
              />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <AdminUsers
                filteredUsers={filteredUsers}
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                showNewUserDialog={showNewUserDialog}
                setShowNewUserDialog={setShowNewUserDialog}
                newUser={newUser}
                setNewUser={setNewUser}
                loading={loading}
                handleCreateUser={handleCreateUser}
                showEditUserDialog={showEditUserDialog}
                setShowEditUserDialog={setShowEditUserDialog}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                handleEditUser={handleEditUser}
                handleDeleteUser={handleDeleteUser}
              />
            </TabsContent>

            {/* Savings Tab */}
            <TabsContent value="savings" className="space-y-6">
              <AdminSavings
                users={users}
                allSavings={allSavings}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                amount={amount}
                setAmount={setAmount}
                description={description}
                setDescription={setDescription}
                loading={loading}
                savingsSearch={savingsSearch}
                setSavingsSearch={setSavingsSearch}
                handleAddSaving={handleAddSaving}
                showEditSavingDialog={showEditSavingDialog}
                setShowEditSavingDialog={setShowEditSavingDialog}
                editingSaving={editingSaving}
                setEditingSaving={setEditingSaving}
                handleUpdateSaving={handleUpdateSaving}
                handleDeleteSaving={handleDeleteSaving}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <AdminAnalytics
                analytics={analytics}
                analyticsLoading={analyticsLoading}
                totalUsers={totalUsers}
                totalSavings={totalSavings}
                chartData={chartData}
                users={users}
              />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <AdminReports
                users={users}
                allSavings={allSavings}
                totalUsers={totalUsers}
                totalSavings={totalSavings}
                chartData={chartData}
                reportType={reportType}
                setReportType={setReportType}
                exportUsersCsv={exportUsersCsv}
                exportSavingsCsv={exportSavingsCsv}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
