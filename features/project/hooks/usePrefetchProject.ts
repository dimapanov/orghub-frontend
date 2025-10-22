import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { DetailedProject } from '../types';
import type { BudgetCategory, BudgetItem } from '../ui/budget/types';

async function fetchProject(projectId: string): Promise<DetailedProject> {
  const token = localStorage.getItem("token")
  const response = await fetch(`/api/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`)
  }

  return response.json()
}

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

export function usePrefetchProject(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    // Prefetch project data
    queryClient.prefetchQuery({
      queryKey: ['project', projectId],
      queryFn: () => fetchProject(projectId),
      staleTime: 30 * 1000,
    });

    // Prefetch budget categories
    queryClient.prefetchQuery({
      queryKey: ['budget-categories', projectId],
      queryFn: () => fetchCategories(projectId),
      staleTime: 30 * 1000,
    });

    // Prefetch budget items
    queryClient.prefetchQuery({
      queryKey: ['budget-items', projectId],
      queryFn: () => fetchItems(projectId),
      staleTime: 30 * 1000,
    });
  }, [projectId, queryClient]);
}
