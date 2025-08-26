"use client";

import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Activity, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminSavings({
  users,
  allSavings,
  selectedUserId,
  setSelectedUserId,
  amount,
  setAmount,
  description,
  setDescription,
  loading,
  savingsSearch,
  setSavingsSearch,
  handleAddSaving,
  showEditSavingDialog,
  setShowEditSavingDialog,
  editingSaving,
  setEditingSaving,
  handleUpdateSaving,
  handleDeleteSaving,
}: any) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Savings Management</h2>
        <p className="text-muted-foreground">
          Add and manage savings entries for users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Savings Form */}
        <Card id="add-savings-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Add Savings Entry
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
                    {users.map((user: any) => (
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

        {/* Recent Savings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent Activity
            </CardTitle>
            <CardDescription>
              Latest savings entries across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allSavings
                .sort(
                  (a: any, b: any) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
                .map((saving: any) => (
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
                        {format(new Date(saving.createdAt), "MMM dd, yyyy")}
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
            <Table className="min-w-max">
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
                {allSavings
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 50)
                  .map((saving: any) => (
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
                            {format(new Date(saving.createdAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(saving.createdAt), "h:mm a")}
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
                                <DialogTitle>Edit Savings Entry</DialogTitle>
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
                                      value={editingSaving.description || ""}
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
                                    <Button type="submit" disabled={loading}>
                                      {loading ? "Updating..." : "Update"}
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
                            onClick={() => handleDeleteSaving(saving.id)}
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
    </>
  );
}
