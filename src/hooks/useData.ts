import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Generic data fetching hook with error handling
export function useApiQuery<T>(
  queryKey: (string | number | boolean | object)[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const { toast } = useToast();

  return useQuery({
    queryKey,
    queryFn,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors except 429 (rate limit)
      if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    onError: (error: any) => {
      console.error('Query error:', error);
      
      // Show user-friendly error messages
      if (error?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "destructive",
        });
      } else if (error?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
          variant: "destructive",
        });
      } else if (error?.status === 404) {
        toast({
          title: "Not Found",
          description: "The requested resource was not found.",
          variant: "destructive",
        });
      } else if (error?.status === 429) {
        toast({
          title: "Too Many Requests",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('Network error')) {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
    ...options,
  });
}

// Generic mutation hook with error handling
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onError: (error: any) => {
      console.error('Mutation error:', error);
      
      // Show user-friendly error messages
      if (error?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "destructive",
        });
      } else if (error?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
      } else if (error?.status === 404) {
        toast({
          title: "Not Found",
          description: "The requested resource was not found.",
          variant: "destructive",
        });
      } else if (error?.status === 409) {
        toast({
          title: "Conflict",
          description: error?.message || "This resource already exists.",
          variant: "destructive",
        });
      } else if (error?.status === 422) {
        // Validation errors
        const details = error?.details || [];
        if (details.length > 0) {
          toast({
            title: "Validation Error",
            description: details.map((d: any) => d.message).join(', '),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Validation Error",
            description: error?.message || "Please check your input and try again.",
            variant: "destructive",
          });
        }
      } else if (error?.status === 429) {
        toast({
          title: "Too Many Requests",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('Network error')) {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
    ...options,
  });
}

// Specific data hooks for different entities

// Contacts hooks
export function useContacts(params?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useApiQuery(
    ['contacts', params],
    () => apiClient.getContacts(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useContact(id: string) {
  return useApiQuery(
    ['contacts', id],
    () => apiClient.getContact(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (data: any) => apiClient.createContact(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        toast({
          title: "Success",
          description: "Contact created successfully",
        });
      },
    }
  );
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateContact(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contacts', id] });
        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      },
    }
  );
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (id: string) => apiClient.deleteContact(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
      },
    }
  );
}

// Products hooks
export function useProducts(params?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useApiQuery(
    ['products', params],
    () => apiClient.getProducts(params),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
}

export function useProduct(id: string) {
  return useApiQuery(
    ['products', id],
    () => apiClient.getProduct(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (data: any) => apiClient.createProduct(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      },
    }
  );
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateProduct(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', id] });
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      },
    }
  );
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (id: string) => apiClient.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      },
    }
  );
}

export function useLowStockProducts() {
  return useApiQuery(
    ['products', 'low-stock'],
    () => apiClient.getLowStockProducts(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );
}

// Transactions hooks
export function useTransactions(params?: {
  type?: string;
  status?: string;
  contactId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useApiQuery(
    ['transactions', params],
    () => apiClient.getTransactions(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useTransaction(id: string) {
  return useApiQuery(
    ['transactions', id],
    () => apiClient.getTransaction(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (data: any) => apiClient.createTransaction(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        toast({
          title: "Success",
          description: "Transaction created successfully",
        });
      },
    }
  );
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateTransaction(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['transactions', id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        });
      },
    }
  );
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (id: string) => apiClient.deleteTransaction(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        });
      },
    }
  );
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    ({ id, status, comments }: { id: string; status: string; comments?: string }) =>
      apiClient.updateTransactionStatus(id, status, comments),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        toast({
          title: "Success",
          description: "Transaction status updated successfully",
        });
      },
    }
  );
}

// Dashboard hooks
export function useDashboardSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useApiQuery(
    ['dashboard-summary', params],
    () => apiClient.getDashboardSummary(params),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    }
  );
}

export function useRecentTransactions(limit = 5) {
  return useApiQuery(
    ['recent-transactions', limit],
    () => apiClient.getTransactions({ limit, sortBy: 'createdAt', sortOrder: 'desc' }),
    {
      staleTime: 1 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
    }
  );
}

// Reports hooks
export function useProfitLossReport(startDate: string, endDate: string) {
  return useApiQuery(
    ['reports', 'profit-loss', startDate, endDate],
    () => apiClient.getProfitLossReport(startDate, endDate),
    {
      enabled: !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useBalanceSheet(asOfDate?: string) {
  return useApiQuery(
    ['reports', 'balance-sheet', asOfDate],
    () => apiClient.getBalanceSheet(asOfDate),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useCashFlowReport(startDate: string, endDate: string) {
  return useApiQuery(
    ['reports', 'cash-flow', startDate, endDate],
    () => apiClient.getCashFlowReport(startDate, endDate),
    {
      enabled: !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useAgingReport(asOfDate?: string) {
  return useApiQuery(
    ['reports', 'aging', asOfDate],
    () => apiClient.getAgingReport(asOfDate),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useSalesReport(params: {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  return useApiQuery(
    ['reports', 'sales', params],
    () => apiClient.getSalesReport(params),
    {
      enabled: !!params.startDate && !!params.endDate,
      staleTime: 5 * 60 * 1000,
    }
  );
}

// Taxes hooks
export function useTaxes(params?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useApiQuery(
    ['taxes', params],
    () => apiClient.getTaxes(params),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

export function useCreateTax() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (data: any) => apiClient.createTax(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['taxes'] });
        toast({
          title: "Success",
          description: "Tax created successfully",
        });
      },
    }
  );
}

export function useUpdateTax() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateTax(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['taxes'] });
        toast({
          title: "Success",
          description: "Tax updated successfully",
        });
      },
    }
  );
}

export function useDeleteTax() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (id: string) => apiClient.deleteTax(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['taxes'] });
        toast({
          title: "Success",
          description: "Tax deleted successfully",
        });
      },
    }
  );
}

// Accounts hooks
export function useAccounts(params?: {
  type?: string;
  parentId?: string;
  page?: number;
  limit?: number;
}) {
  return useApiQuery(
    ['accounts', params],
    () => apiClient.getAccounts(params),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
}

export function useAccountHierarchy() {
  return useApiQuery(
    ['accounts', 'hierarchy'],
    () => apiClient.getAccountHierarchy(),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    }
  );
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (data: any) => apiClient.createAccount(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'hierarchy'] });
        toast({
          title: "Success",
          description: "Account created successfully",
        });
      },
    }
  );
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateAccount(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'hierarchy'] });
        toast({
          title: "Success",
          description: "Account updated successfully",
        });
      },
    }
  );
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useApiMutation(
    (id: string) => apiClient.deleteAccount(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'hierarchy'] });
        toast({
          title: "Success",
          description: "Account deleted successfully",
        });
      },
    }
  );
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  queryKey: (string | number | boolean | object)[],
  updateFn: (oldData: T | undefined, newData: any) => T
) {
  const queryClient = useQueryClient();

  return (newData: any) => {
    queryClient.setQueryData(queryKey, (oldData: T | undefined) => 
      updateFn(oldData, newData)
    );
  };
}

// Hook for prefetching data
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchContact = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['contacts', id],
      queryFn: () => apiClient.getContact(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchProduct = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['products', id],
      queryFn: () => apiClient.getProduct(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchTransaction = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['transactions', id],
      queryFn: () => apiClient.getTransaction(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchContact,
    prefetchProduct,
    prefetchTransaction,
  };
}
