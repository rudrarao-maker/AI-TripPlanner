import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface ExpenseSplit {
  id?: string;
  expenseId?: string;
  userId: string;
  amount: number;
  status?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Expense {
  id: string;
  tripId: string;
  userId: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  splitType: string;
  splits: ExpenseSplit[];
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface AddExpensePayload {
  tripId: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  splitType: string;
  splits: { userId: string; amount: number }[];
}

export const useGetExpenses = (tripId: string) => {
  return useQuery<Expense[]>({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const { data } = await api.get(`/trips/${tripId}/expenses`);
      return data.data;
    },
    enabled: !!tripId,
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddExpensePayload) => {
      const { data } = await api.post(`/trips/${payload.tripId}/expenses`, payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.tripId],
      });
    },
  });
};
