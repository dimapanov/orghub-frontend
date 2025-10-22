import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BudgetCategory, BudgetItem } from '../ui/budget/types';

interface UseBudgetReturn {
  categories: BudgetCategory[];
  items: BudgetItem[];
  loading: boolean;
  error: string | null;
  createCategory: (data: Omit<BudgetCategory, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateCategory: (id: string, data: Partial<BudgetCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createItem: (data: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateItem: (id: string, data: Partial<BudgetItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// Fetch functions
async function fetchCategories(projectId: string): Promise<BudgetCategory[]> {
  const response = await fetch(`/api/budget/projects/${projectId}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

async function fetchItems(projectId: string): Promise<BudgetItem[]> {
  const response = await fetch(`/api/budget/projects/${projectId}/items`);
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
}

export function useBudget(projectId: string | undefined): UseBudgetReturn {
  const queryClient = useQueryClient();

  // Fetch categories with React Query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['budget-categories', projectId],
    queryFn: () => fetchCategories(projectId!),
    enabled: !!projectId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Fetch items with React Query
  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError,
  } = useQuery({
    queryKey: ['budget-items', projectId],
    queryFn: () => fetchItems(projectId!),
    enabled: !!projectId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const loading = categoriesLoading || itemsLoading;
  const error = categoriesError?.message || itemsError?.message || null;

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: Omit<BudgetCategory, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch(`/api/budget/projects/${projectId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData<BudgetCategory[]>(['budget-categories', projectId], (prev = []) => [...prev, newCategory]);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BudgetCategory> }) => {
      const response = await fetch(`/api/budget/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: (updatedCategory, { id }) => {
      queryClient.setQueryData<BudgetCategory[]>(['budget-categories', projectId], (prev = []) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/budget/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData<BudgetCategory[]>(['budget-categories', projectId], (prev = []) =>
        prev.filter((cat) => cat.id !== id)
      );
      queryClient.setQueryData<BudgetItem[]>(['budget-items', projectId], (prev = []) =>
        prev.filter((item) => item.categoryId !== id)
      );
    },
  });

  // Item mutations
  const createItemMutation = useMutation({
    mutationFn: async (data: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch(`/api/budget/projects/${projectId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (!response.ok) throw new Error('Failed to create item');
      return response.json();
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<BudgetItem[]>(['budget-items', projectId], (prev = []) => [...prev, newItem]);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BudgetItem> }) => {
      const response = await fetch(`/api/budget/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: (updatedItem, { id }) => {
      queryClient.setQueryData<BudgetItem[]>(['budget-items', projectId], (prev = []) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/budget/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData<BudgetItem[]>(['budget-items', projectId], (prev = []) =>
        prev.filter((item) => item.id !== id)
      );
    },
  });

  return {
    categories,
    items,
    loading,
    error,
    createCategory: async (data: Omit<BudgetCategory, "id" | "createdAt" | "updatedAt">) => {
      await createCategoryMutation.mutateAsync(data);
    },
    updateCategory: async (id: string, data: Partial<BudgetCategory>) => {
      await updateCategoryMutation.mutateAsync({ id, data });
    },
    deleteCategory: async (id: string) => {
      await deleteCategoryMutation.mutateAsync(id);
    },
    createItem: async (data: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => {
      await createItemMutation.mutateAsync(data);
    },
    updateItem: async (id: string, data: Partial<BudgetItem>) => {
      await updateItemMutation.mutateAsync({ id, data });
    },
    deleteItem: async (id: string) => {
      await deleteItemMutation.mutateAsync(id);
    },
  };
}