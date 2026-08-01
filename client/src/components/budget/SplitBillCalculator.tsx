import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, ArrowRight } from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  paid: number;
}

export function SplitBillCalculator() {
  const [members, setMembers] = useState<GroupMember[]>([
    { id: "1", name: "You", paid: 15000 },
    { id: "2", name: "Alex", paid: 5000 },
    { id: "3", name: "Sam", paid: 10000 },
  ]);
  const [newMember, setNewMember] = useState("");

  const totalSpent = members.reduce((sum, m) => sum + m.paid, 0);
  const splitAmount = totalSpent / members.length;

  const handleAddMember = () => {
    if (newMember.trim()) {
      setMembers([
        ...members,
        { id: Date.now().toString(), name: newMember, paid: 0 },
      ]);
      setNewMember("");
    }
  };

  const updatePaid = (id: string, amount: string) => {
    const val = parseFloat(amount) || 0;
    setMembers(members.map((m) => (m.id === id ? { ...m, paid: val } : m)));
  };

  // Calculate who owes who
  const debts = members.map((m) => ({ ...m, balance: m.paid - splitAmount }));
  const creditors = debts
    .filter((d) => d.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const debtors = debts
    .filter((d) => d.balance < 0)
    .sort((a, b) => a.balance - b.balance);

  const transactions: { from: string; to: string; amount: number }[] = [];

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amount > 0.01) {
      // Floating point tolerance
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount,
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" /> Group Expense Split
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Members Input */}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <Input
                value={member.name}
                disabled
                className="w-1/2 bg-muted/30"
              />
              <div className="relative w-1/2">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  type="number"
                  value={member.paid || ""}
                  onChange={(e) => updatePaid(member.id, e.target.value)}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Add new member..."
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
            <Button variant="outline" onClick={handleAddMember}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl text-sm font-medium">
          <span>
            Total Group Spend:{" "}
            <span className="font-bold text-primary">₹{totalSpent}</span>
          </span>
          <span>
            Per Person:{" "}
            <span className="font-bold text-primary">
              ₹{splitAmount.toFixed(0)}
            </span>
          </span>
        </div>

        {/* Settlements */}
        <div>
          <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
            How to settle up
          </h4>
          {transactions.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground p-4 bg-muted/20 rounded-lg">
              Everyone is settled up! 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-destructive">
                      {tx.from}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-green-500">
                      {tx.to}
                    </span>
                  </div>
                  <span className="font-bold">₹{tx.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
