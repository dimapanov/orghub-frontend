import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { DetailedProject, Task, TaskStatus } from "../types"

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

export function useProject(projectId: string | undefined) {
  const queryClient = useQueryClient()

  const {
    data: project,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 секунд - данные считаются свежими
    gcTime: 5 * 60 * 1000, // 5 минут - время хранения в кэше
  })

  // Мутация для обновления задачи
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (updatedTask, { taskId, updates }) => {
      // Оптимистичное обновление кэша
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev

        // Вспомогательная функция для поиска и удаления задачи из дерева
        const findAndRemoveTask = (tasks: Task[], targetId: string): { tasks: Task[], removedTask: Task | null } => {
          const result: Task[] = []
          let removedTask: Task | null = null

          for (const task of tasks) {
            if (task.id === targetId) {
              removedTask = task
              continue
            }

            if (task.children && task.children.length > 0) {
              const { tasks: newChildren, removedTask: found } = findAndRemoveTask(task.children, targetId)
              if (found) {
                removedTask = found
                result.push({
                  ...task,
                  children: newChildren.length > 0 ? newChildren : undefined,
                })
              } else {
                result.push(task)
              }
            } else {
              result.push(task)
            }
          }

          return { tasks: result, removedTask }
        }

        // Вспомогательная функция для добавления задачи в дерево
        const addTaskToParent = (tasks: Task[], task: Task, parentId: string | null): Task[] => {
          if (!parentId) {
            return [...tasks, task]
          }

          return tasks.map(t => {
            if (t.id === parentId) {
              return {
                ...t,
                children: [...(t.children || []), task],
              }
            }

            if (t.children && t.children.length > 0) {
              return {
                ...t,
                children: addTaskToParent(t.children, task, parentId),
              }
            }

            return t
          })
        }

        // Если изменился parentId, нужно переместить задачу
        if ('parentId' in updates) {
          const { tasks: tasksWithoutTarget, removedTask } = findAndRemoveTask(prev.tasks, taskId)

          if (!removedTask) {
            return prev
          }

          const taskToAdd = {
            ...removedTask,
            ...updatedTask,
            children: updatedTask.children || removedTask.children,
          }

          const newTasks = addTaskToParent(tasksWithoutTarget, taskToAdd, updates.parentId || null)

          return {
            ...prev,
            tasks: newTasks,
          }
        } else {
          // Если parentId не изменился, просто обновляем свойства на месте
          const updateTaskRecursive = (task: Task): Task => {
            if (task.id === taskId) {
              return {
                ...task,
                ...updatedTask,
                children: updatedTask.children || task.children,
              }
            }

            if (task.children && task.children.length > 0) {
              return {
                ...task,
                children: task.children.map(updateTaskRecursive),
              }
            }

            return task
          }

          return {
            ...prev,
            tasks: prev.tasks.map(updateTaskRecursive),
          }
        }
      })
    },
  })

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTaskMutation.mutateAsync({ taskId, updates })
  }

  // Мутация для изменения порядка задач
  const reorderTasksMutation = useMutation({
    mutationFn: async (reorderedTasks: Task[]) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks/reorder`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: reorderedTasks.map((task, index) => ({
            id: task.id,
            orderIndex: index,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to reorder tasks: ${response.statusText}`)
      }

      return response.json()
    },
    onMutate: async (reorderedTasks) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ["project", projectId] })

      // Сохраняем предыдущее состояние
      const previousProject = queryClient.getQueryData<DetailedProject>(["project", projectId])

      // Оптимистичное обновление
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: reorderedTasks,
        }
      })

      return { previousProject }
    },
    onError: (_err, _reorderedTasks, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousProject) {
        queryClient.setQueryData(["project", projectId], context.previousProject)
      }
    },
  })

  const reorderTasks = async (reorderedTasks: Task[]) => {
    await reorderTasksMutation.mutateAsync(reorderedTasks)
  }

  // Мутация для переключения статуса задачи
  const toggleTaskStatusMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!project) throw new Error("Project not loaded")

      // Рекурсивная функция для поиска задачи
      const findTask = (tasks: Task[]): Task | null => {
        for (const task of tasks) {
          if (task.id === taskId) return task
          if (task.children) {
            const found = findTask(task.children)
            if (found) return found
          }
        }
        return null
      }

      const task = findTask(project.tasks)
      if (!task) throw new Error("Task not found")

      const newStatus: TaskStatus = task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update task status: ${response.statusText}`)
      }

      return { taskId, newStatus }
    },
    onSuccess: ({ taskId, newStatus }) => {
      // Обновляем кэш
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev

        const updateTaskStatus = (task: Task): Task => {
          if (task.id === taskId) {
            return { ...task, status: newStatus }
          }

          if (task.children && task.children.length > 0) {
            return {
              ...task,
              children: task.children.map(updateTaskStatus),
            }
          }

          return task
        }

        return {
          ...prev,
          tasks: prev.tasks.map(updateTaskStatus),
        }
      })
    },
  })

  const toggleTaskStatus = async (taskId: string) => {
    await toggleTaskStatusMutation.mutateAsync(taskId)
  }

  // Мутация для создания задачи
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task> & { title: string }) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (newTask, taskData) => {
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev

        // Если это подзадача, обновляем родительскую задачу
        if (taskData.parentId) {
          return {
            ...prev,
            tasks: prev.tasks.map((t: Task) =>
              t.id === taskData.parentId
                ? {
                    ...t,
                    children: [...(t.children || []), newTask],
                  }
                : t
            ),
          }
        }

        // Иначе добавляем как обычную задачу
        return {
          ...prev,
          tasks: [...prev.tasks, newTask],
        }
      })
    },
  })

  const createTask = async (taskData: Partial<Task> & { title: string }) => {
    return await createTaskMutation.mutateAsync(taskData)
  }

  // Мутация для создания группы задач
  const createTaskGroupMutation = useMutation({
    mutationFn: async (groupData: { name: string; description?: string; color?: string }) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/task-groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create task group: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (newGroup) => {
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          taskGroups: [...prev.taskGroups, newGroup],
        }
      })
    },
  })

  const createTaskGroup = async (groupData: { name: string; description?: string; color?: string }) => {
    return await createTaskGroupMutation.mutateAsync(groupData)
  }

  // Мутация для обновления группы задач
  const updateTaskGroupMutation = useMutation({
    mutationFn: async ({ groupId, updates }: { groupId: string; updates: { name?: string; description?: string; color?: string } }) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/task-groups/${groupId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Failed to update task group: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (updatedGroup, { groupId }) => {
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          taskGroups: prev.taskGroups.map((g) => (g.id === groupId ? updatedGroup : g)),
        }
      })
    },
  })

  const updateTaskGroup = async (groupId: string, updates: { name?: string; description?: string; color?: string }) => {
    return await updateTaskGroupMutation.mutateAsync({ groupId, updates })
  }

  // Мутация для удаления группы задач
  const deleteTaskGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/task-groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete task group: ${response.statusText}`)
      }
    },
    onSuccess: (_data, groupId) => {
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          taskGroups: prev.taskGroups.filter((g) => g.id !== groupId),
        }
      })
    },
  })

  const deleteTaskGroup = async (groupId: string) => {
    await deleteTaskGroupMutation.mutateAsync(groupId)
  }

  // Мутация для удаления задачи
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`)
      }
    },
    onSuccess: (_data, taskId) => {
      queryClient.setQueryData<DetailedProject>(["project", projectId], (prev) => {
        if (!prev) return prev

        const removeTaskRecursive = (tasks: Task[]): Task[] => {
          return tasks
            .filter(task => task.id !== taskId)
            .map(task => {
              if (task.children && task.children.length > 0) {
                return {
                  ...task,
                  children: removeTaskRecursive(task.children),
                }
              }
              return task
            })
        }

        return {
          ...prev,
          tasks: removeTaskRecursive(prev.tasks),
        }
      })
    },
  })

  const deleteTask = async (taskId: string) => {
    await deleteTaskMutation.mutateAsync(taskId)
  }

  return {
    project: project ?? null,
    loading,
    error: error as Error | null,
    refetch,
    updateTask,
    reorderTasks,
    toggleTaskStatus,
    createTask,
    createTaskGroup,
    updateTaskGroup,
    deleteTaskGroup,
    deleteTask,
  }
}
