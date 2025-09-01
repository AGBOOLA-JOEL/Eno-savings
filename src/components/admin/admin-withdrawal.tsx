import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { format } from "date-fns";
import { DollarSign } from "lucide-react";

export {};

export default function AdminWithdrawal({
  users,
  loading,
  setLoading,
  toast,
}: any) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [allLoading, setAllLoading] = useState(false);

  // Fetch withdrawal history for selected user
  useEffect(() => {
    if (!selectedUserId) {
      setWithdrawals([]);
      return;
    }
    setHistoryLoading(true);
    fetch(`/api/admin/withdrawals?userId=${selectedUserId}`)
      .then((res) => res.json())
      .then((data) => setWithdrawals(data.withdrawals || []))
      .catch(() => setWithdrawals([]))
      .finally(() => setHistoryLoading(false));
  }, [selectedUserId]);

  // Fetch all withdrawals on mount
  useEffect(() => {
    setAllLoading(true);
    fetch("/api/admin/withdrawals")
      .then((res) => res.json())
      .then((data) => setAllWithdrawals(data.withdrawals || []))
      .catch(() => setAllWithdrawals([]))
      .finally(() => setAllLoading(false));
  }, []);

  // Get user's available balance
  const getUserAvailable = (user: any) => {
    const totalSavings = user.savings.reduce(
      (sum: number, s: any) => sum + s.amount,
      0
    );
    const totalWithdrawals = withdrawals.reduce(
      (sum: number, w: any) => sum + w.amount,
      0
    );
    return totalSavings - totalWithdrawals;
  };

  const handleWithdraw = async (e: any) => {
    e.preventDefault();
    if (!selectedUserId || !amount) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: Number.parseFloat(amount),
          description: description.trim() || null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success!", description: "Withdrawal processed." });
        setAmount("");
        setDescription("");
        // Refresh withdrawal history
        fetch(`/api/admin/withdrawals?userId=${selectedUserId}`)
          .then((res) => res.json())
          .then((data) => setWithdrawals(data.withdrawals || []));
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process withdrawal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u: any) => u.id === selectedUserId);
  const available = selectedUser ? getUserAvailable(selectedUser) : 0;

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" /> Withdrawal Management
        </h2>
        <p className="text-muted-foreground">
          Process and view user withdrawals
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Withdraw Form */}
        <Card>
          <CardHeader>
            <CardTitle>Process Withdrawal</CardTitle>
            <CardDescription>
              Withdraw funds from a user's savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
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
              {selectedUser && (
                <div className="text-xs text-muted-foreground">
                  Available:{" "}
                  <span className="font-semibold">
                    ₦
                    {available.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
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
                  min={0.01}
                  max={available}
                  disabled={!selectedUserId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a note about this withdrawal"
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !selectedUserId ||
                  !amount ||
                  Number(amount) > available
                }
              >
                {loading ? "Processing..." : "Withdraw"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>
              Recent withdrawals for selected user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div>Loading...</div>
            ) : withdrawals.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No withdrawals found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.slice(0, 20).map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell>
                          <span className="font-semibold text-red-600">
                            -₦
                            {w.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {w.description || (
                            <span className="text-muted-foreground">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {format(new Date(w.createdAt), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(w.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* General Withdrawal History Table */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>All Users Withdrawal History</CardTitle>
            <CardDescription>
              Recent withdrawals across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allLoading ? (
              <div>Loading...</div>
            ) : allWithdrawals.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No withdrawals found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allWithdrawals.slice(0, 50).map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell>
                          {w.user?.name || w.user?.email || "-"}
                        </TableCell>
                        <TableCell>{w.user?.email || "-"}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-red-600">
                            -₦
                            {w.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {w.description || (
                            <span className="text-muted-foreground">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {format(new Date(w.createdAt), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(w.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
