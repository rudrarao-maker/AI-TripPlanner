export interface Transaction {
  from: string; // userId
  to: string; // userId
  amount: number;
}

export interface SplitUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ExpenseRecord {
  id: string;
  payerId: string;
  amount: number;
  description: string;
  splits: { userId: string; amount: number }[];
}

export function calculateBalances(expenses: ExpenseRecord[], users: SplitUser[]) {
  // Map of userId -> net balance (+ means they are owed money, - means they owe money)
  const balances: Record<string, number> = {};
  
  // Initialize balances to 0
  users.forEach(u => balances[u.id] = 0);
  
  // Also initialize for users that might exist in expenses but not explicitly passed
  expenses.forEach(exp => {
    if (balances[exp.payerId] === undefined) balances[exp.payerId] = 0;
    exp.splits.forEach(s => {
      if (balances[s.userId] === undefined) balances[s.userId] = 0;
    });
  });

  // Calculate net balances
  expenses.forEach(expense => {
    // Payer's balance goes UP by the total amount they paid
    balances[expense.payerId] += expense.amount;
    
    // Each person involved in the split's balance goes DOWN by their share
    expense.splits.forEach(split => {
      balances[split.userId] -= split.amount;
    });
  });

  // To fix floating point precision issues (e.g., 0.00000000000002)
  Object.keys(balances).forEach(id => {
    balances[id] = Math.round(balances[id] * 100) / 100;
  });

  return balances;
}

export function simplifyDebts(balances: Record<string, number>): Transaction[] {
  const transactions: Transaction[] = [];
  
  // Create arrays for people who OWE money (debtors) and people who are OWED money (creditors)
  const debtors: { id: string, amount: number }[] = [];
  const creditors: { id: string, amount: number }[] = [];

  for (const [id, balance] of Object.entries(balances)) {
    if (balance < -0.01) {
      debtors.push({ id, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    }
  }

  // Sort them by amount (largest first) to try and minimize transactions
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    // The amount to settle is the minimum of what the debtor owes and the creditor is owed
    const amountToSettle = Math.min(debtor.amount, creditor.amount);
    
    if (amountToSettle > 0.01) {
      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amountToSettle * 100) / 100
      });
    }

    // Update their remaining balances
    debtor.amount -= amountToSettle;
    creditor.amount -= amountToSettle;

    // Move to next person if their balance is settled
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}
