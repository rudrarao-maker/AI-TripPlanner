"use client";
import { useState, useEffect } from "react";
import { X, Users, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SplitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  collaborators: { id: string; name: string; avatar?: string }[];
  onSave: (
    splits: { userId: string; amount: number }[],
    type: "equal" | "exact" | "percentage",
  ) => void;
}

export function SplitExpenseModal({
  isOpen,
  onClose,
  totalAmount,
  collaborators,
  onSave,
}: SplitExpenseModalProps) {
  const [splitType, setSplitType] = useState<"equal" | "exact" | "percentage">(
    "equal",
  );
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set(collaborators.map((c) => c.id)),
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSplitType("equal");
      setSelectedUsers(new Set(collaborators.map((c) => c.id)));
      setExactAmounts({});
      setPercentages({});
    }
  }, [isOpen, collaborators]);

  const toggleUser = (userId: string) => {
    const next = new Set(selectedUsers);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelectedUsers(next);
  };

  const calculateSplit = () => {
    const splits: { userId: string; amount: number }[] = [];

    if (splitType === "equal") {
      const perPerson = totalAmount / (selectedUsers.size || 1);
      selectedUsers.forEach((userId) => {
        splits.push({ userId, amount: parseFloat(perPerson.toFixed(2)) });
      });
    } else if (splitType === "exact") {
      selectedUsers.forEach((userId) => {
        splits.push({
          userId,
          amount: parseFloat(exactAmounts[userId] || "0"),
        });
      });
    } else if (splitType === "percentage") {
      selectedUsers.forEach((userId) => {
        const percent = parseFloat(percentages[userId] || "0");
        splits.push({
          userId,
          amount: parseFloat(((totalAmount * percent) / 100).toFixed(2)),
        });
      });
    }

    return splits;
  };

  const handleSave = () => {
    const splits = calculateSplit();

    // Validate exact totals
    if (splitType === "exact") {
      const sum = splits.reduce((acc, curr) => acc + curr.amount, 0);
      if (Math.abs(sum - totalAmount) > 0.1) {
        alert(`Amounts must equal exactly ${totalAmount}. Currently: ${sum}`);
        return;
      }
    }

    // Validate percentage totals
    if (splitType === "percentage") {
      const sum =
        selectedUsers.size > 0
          ? Array.from(selectedUsers).reduce(
              (acc, userId) => acc + parseFloat(percentages[userId] || "0"),
              0,
            )
          : 0;
      if (Math.abs(sum - 100) > 0.1) {
        alert(`Percentages must equal exactly 100%. Currently: ${sum}%`);
        return;
      }
    }

    onSave(splits, splitType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
          >
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Split Expense
              </h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center mb-6">
                <div className="bg-muted p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setSplitType("equal")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${splitType === "equal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    =', Equal
                  </button>
                  <button
                    onClick={() => setSplitType("exact")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${splitType === "exact" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    1.23 Exact
                  </button>
                  <button
                    onClick={() => setSplitType("percentage")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${splitType === "percentage" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    % Percent
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {collaborators.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleUser(user.id)}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${selectedUsers.has(user.id) ? "bg-primary border-primary" : "border-muted-foreground"}`}
                      >
                        {selectedUsers.has(user.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {user.avatar ? (
                          <img src={user.avatar} className="rounded-full" />
                        ) : (
                          user.name[0]
                        )}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>

                    {selectedUsers.has(user.id) && (
                      <div className="w-24">
                        {splitType === "equal" && (
                          <span className="font-mono text-sm text-muted-foreground">
                            {(totalAmount / selectedUsers.size).toFixed(2)}
                          </span>
                        )}
                        {splitType === "exact" && (
                          <Input
                            type="number"
                            className="h-8 text-right bg-background/50"
                            placeholder="0.00"
                            value={exactAmounts[user.id] || ""}
                            onChange={(e) =>
                              setExactAmounts((prev) => ({
                                ...prev,
                                [user.id]: e.target.value,
                              }))
                            }
                          />
                        )}
                        {splitType === "percentage" && (
                          <div className="relative">
                            <Input
                              type="number"
                              className="h-8 pr-6 text-right bg-background/50"
                              placeholder="0"
                              value={percentages[user.id] || ""}
                              onChange={(e) =>
                                setPercentages((prev) => ({
                                  ...prev,
                                  [user.id]: e.target.value,
                                }))
                              }
                            />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button className="w-full font-bold" onClick={handleSave}>
                Confirm Split
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
