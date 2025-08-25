"use client";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

export default function AdminUsers({
  filteredUsers,
  userSearch,
  setUserSearch,
  showNewUserDialog,
  setShowNewUserDialog,
  newUser,
  setNewUser,
  loading,
  handleCreateUser,
  showEditUserDialog,
  setShowEditUserDialog,
  editingUser,
  setEditingUser,
  handleEditUser,
  handleDeleteUser,
}: any) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage all users and their profiles
          </p>
        </div>
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add User
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
      </div>

      <Card className="mt-6">
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
                {filteredUsers.map((user: any) => {
                  const userTotal = user.savings.reduce(
                    (sum: number, s: any) => sum + s.amount,
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
                          <Badge variant="secondary">{user.frequency}</Badge>
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
                              showEditUserDialog && editingUser?.id === user.id
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
                                    <Label htmlFor="edit-name">Full Name</Label>
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
                                    <Label htmlFor="edit-email">Email</Label>
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
                                    <Label htmlFor="edit-phone">Phone</Label>
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
                                      value={editingUser.frequency || ""}
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
                                      {loading ? "Updating..." : "Update User"}
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
    </>
  );
}
