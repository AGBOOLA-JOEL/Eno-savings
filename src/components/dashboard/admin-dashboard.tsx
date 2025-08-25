"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Trash2, Edit, Plus, Users, Wallet, TrendingUp, DollarSign } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  savings: Saving[]
}

interface Saving {
  id: string
  amount: number
  description: string | null
  createdAt: string
  userId: string
}

interface AdminDashboardProps {
  users: User[]
  currentUser: User
}

export default function AdminDashboard({ users, currentUser }: AdminDashboardProps) {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddSavingOpen, setIsAddSavingOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "USER" })
  const [newSaving, setNewSaving] = useState({ userId: "", amount: "", description: "" })
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics
  const totalUsers = users.length
  const totalSavings = users.reduce(
    (sum, user) => sum + user.savings.reduce((userSum, saving) => userSum + saving.amount, 0),
    0,
  )
  const averageSavings = totalUsers > 0 ? totalSavings / totalUsers : 0
  const activeUsers = users.filter((user) => user.savings.length > 0).length

  // Prepare chart data
  const chartData = users
    .map((user) => ({
      name: user.name || "Unknown",
      savings: user.savings.reduce((sum, saving) => sum + saving.amount, 0),
    }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 10)

  const monthlyData = users
    .reduce((acc: any[], user) => {
      user.savings.forEach((saving) => {
        const month = new Date(saving.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        const existingMonth = acc.find((item) => item.month === month)
        if (existingMonth) {
          existingMonth.amount += saving.amount
        } else {
          acc.push({ month, amount: saving.amount })
        }
      })
      return acc
    }, [])
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  const handleAddUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        toast({ title: "Success", description: "User added successfully" })
        setIsAddUserOpen(false)
        setNewUser({ name: "", email: "", role: "USER" })
        window.location.reload()
      } else {
        toast({ title: "Error", description: "Failed to add user", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add user", variant: "destructive" })
    }
  }

  const handleAddSaving = async () => {
    try {
      const response = await fetch("/api/admin/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newSaving.userId,
          amount: Number.parseFloat(newSaving.amount),
          description: newSaving.description,
        }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Savings entry added successfully" })
        setIsAddSavingOpen(false)
        setNewSaving({ userId: "", amount: "", description: "" })
        window.location.reload()
      } else {
        toast({ title: "Error", description: "Failed to add savings entry", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add savings entry", variant: "destructive" })
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "User updated successfully" })
        setIsEditUserOpen(false)
        setEditingUser(null)
        window.location.reload()
      } else {
        toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "User deleted successfully" })
        window.location.reload()
      } else {
        toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per user</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Users with savings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Savers</CardTitle>
            <CardDescription>Users with highest savings amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                savings: {
                  label: "Savings",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="savings" fill="var(--color-savings)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Savings Trend</CardTitle>
            <CardDescription>Savings growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ${user.savings.reduce((sum, saving) => sum + saving.amount, 0).toLocaleString()} saved
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingUser(user)
                      setIsEditUserOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderSavingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Savings Management</h2>
        <Dialog open={isAddSavingOpen} onOpenChange={setIsAddSavingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Savings Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings Entry</DialogTitle>
              <DialogDescription>Add a new savings entry for a user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">User</Label>
                <Select
                  value={newSaving.userId}
                  onValueChange={(value) => setNewSaving({ ...newSaving, userId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
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
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newSaving.amount}
                  onChange={(e) => setNewSaving({ ...newSaving, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSaving.description}
                  onChange={(e) => setNewSaving({ ...newSaving, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSaving}>Add Savings Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map(
          (user) =>
            user.savings.length > 0 && (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name || "Unknown"}</span>
                  </CardTitle>
                  <CardDescription>
                    Total: ${user.savings.reduce((sum, saving) => sum + saving.amount, 0).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.savings.map((saving) => (
                      <div key={saving.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">${saving.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{saving.description}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(saving.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ),
        )}
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports & Analytics</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-semibold">{totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Users:</span>
                <span className="font-semibold">{activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Admin Users:</span>
                <span className="font-semibold">{users.filter((u) => u.role === "ADMIN").length}</span>
              </div>
              <div className="flex justify-between">
                <span>Regular Users:</span>
                <span className="font-semibold">{users.filter((u) => u.role === "USER").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Savings:</span>
                <span className="font-semibold">${totalSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Average per User:</span>
                <span className="font-semibold">${averageSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Highest Saver:</span>
                <span className="font-semibold">
                  ${Math.max(...users.map((u) => u.savings.reduce((sum, s) => sum + s.amount, 0))).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Entries:</span>
                <span className="font-semibold">{users.reduce((sum, u) => sum + u.savings.length, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return renderUsersTab()
      case "savings":
        return renderSavingsTab()
      case "reports":
        return renderReportsTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {activeTab === "users"
            ? "User Management"
            : activeTab === "savings"
              ? "Savings Management"
              : activeTab === "reports"
                ? "Reports"
                : "Admin Dashboard"}
        </h2>
      </div>
      {renderContent()}
    </div>
  )
}
