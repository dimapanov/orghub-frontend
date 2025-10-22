import { useMemo, useState } from "react"
import { Gantt, type Task as GanttTask, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import type { Task, TaskGroup } from "../../types"
import { ViewModeSelector } from "./view-mode-selector"
import { TaskListHeaderDefault, TaskListTableDefault } from "./task-list-table"

interface InfoCardProps {
  tasks: Task[]
  taskGroups?: TaskGroup[]
  onTaskUpdate?: (taskId: string, updates: { startDate?: string; endDate?: string; progress?: number }) => Promise<void>
}

export function InfoCard({ tasks, taskGroups = [], onTaskUpdate }: InfoCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const ganttTasks = useMemo(() => {
    if (tasks.length === 0) return []

    const result: GanttTask[] = []

    const tasksWithDates = tasks.filter((task) => task.startDate || task.endDate)

    // Задачи без группы
    const ungroupedTasks = tasksWithDates.filter(t => !t.taskGroupId)

    // Задачи по группам
    const tasksByGroup = new Map<string, Task[]>()
    tasksWithDates.forEach(task => {
      if (task.taskGroupId) {
        const groupTasks = tasksByGroup.get(task.taskGroupId) || []
        groupTasks.push(task)
        tasksByGroup.set(task.taskGroupId, groupTasks)
      }
    })

    // Добавляем группы с их задачами
    taskGroups
      .filter(group => tasksByGroup.has(group.id))
      .forEach(group => {
        const groupTasks = tasksByGroup.get(group.id)!

        // Вычисляем диапазон дат для группы
        const groupDates = groupTasks.map(task => {
          const endDate = task.endDate ? new Date(task.endDate) : new Date()
          const startDate = task.startDate ? new Date(task.startDate) : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          return { start: startDate, end: endDate }
        })

        const groupStart = new Date(Math.min(...groupDates.map(d => d.start.getTime())))
        const groupEnd = new Date(Math.max(...groupDates.map(d => d.end.getTime())))

        // Добавляем группу как "project"
        const groupId = `group-${group.id}`
        const isCollapsed = expandedTasks.has(groupId)

        result.push({
          id: groupId,
          name: group.name,
          start: groupStart,
          end: groupEnd,
          progress: 0,
          type: "project",
          hideChildren: isCollapsed,
          styles: {
            backgroundColor: group.color || "#3b82f6",
            backgroundSelectedColor: group.color || "#3b82f6",
          },
        })

        // Добавляем задачи группы (только если группа не свернута)
        if (!isCollapsed) {
          groupTasks.forEach(task => {
            result.push(createGanttTask(task, `group-${group.id}`))
          })
        }
      })

    // Добавляем задачи без группы
    ungroupedTasks.forEach(task => {
      result.push(createGanttTask(task))
    })

    return result
  }, [tasks, taskGroups, expandedTasks])

  // Вспомогательная функция для создания GanttTask
  function createGanttTask(task: Task, project?: string): GanttTask {
    const endDate = task.endDate ? new Date(task.endDate) : new Date()
    const startDate = task.startDate
      ? new Date(task.startDate)
      : (() => {
          const calculated = new Date(endDate)
          calculated.setDate(calculated.getDate() - 7)
          return calculated
        })()

    return {
      id: task.id,
      name: task.title,
      start: startDate,
      end: endDate,
      progress: task.status === "COMPLETED" ? 100 : task.status === "IN_PROGRESS" ? 50 : 0,
      type: "task",
      project,
      styles: {
        backgroundColor: getTaskColor(task.status),
        backgroundSelectedColor: getTaskColor(task.status),
        progressColor: task.priority ? getProgressColor(task.priority) : "#6b7280",
        progressSelectedColor: task.priority ? getProgressColor(task.priority) : "#6b7280",
      },
    }
  }

  // Обработчик изменения дат при перетаскивании блока
  const handleDateChange = async (task: GanttTask) => {
    if (!onTaskUpdate || isUpdating) return

    try {
      setIsUpdating(true)
      await onTaskUpdate(task.id, {
        startDate: task.start.toISOString(),
        endDate: task.end.toISOString(),
      })
    } catch (error) {
      console.error("Failed to update task dates:", error)
      // В случае ошибки можно показать уведомление пользователю
      alert("Не удалось обновить даты задачи. Попробуйте еще раз.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Обработчик изменения прогресса
  const handleProgressChange = async (task: GanttTask) => {
    if (!onTaskUpdate || isUpdating) return

    try {
      setIsUpdating(true)
      await onTaskUpdate(task.id, {
        progress: task.progress,
      })
    } catch (error) {
      console.error("Failed to update task progress:", error)
      alert("Не удалось обновить прогресс задачи. Попробуйте еще раз.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Обработчик сворачивания/разворачивания групп
  const handleExpanderClick = (task: GanttTask) => {
    console.log('handleExpanderClick called:', task.id, task.name)
    setExpandedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(task.id)) {
        console.log('Removing from collapsed set (expanding):', task.id)
        newSet.delete(task.id)
      } else {
        console.log('Adding to collapsed set (collapsing):', task.id)
        newSet.add(task.id)
      }
      console.log('New collapsed tasks:', Array.from(newSet))
      return newSet
    })
  }

  if (ganttTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-muted-foreground">
          Нет задач с установленными датами для отображения в инфокарте
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewModeSelector value={viewMode} onChange={setViewMode} />
      </div>
      <div className="w-full overflow-auto border rounded-lg p-4 bg-white">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          locale="ru"
          listCellWidth="200px"
          columnWidth={60}
          ganttHeight={400}
          barCornerRadius={4}
          fontSize="14"
          todayColor="rgba(59, 130, 246, 0.2)"
          onDateChange={handleDateChange}
          onProgressChange={handleProgressChange}
          onExpanderClick={handleExpanderClick}
          TaskListHeader={TaskListHeaderDefault}
          TaskListTable={(props) => (
            <TaskListTableDefault
              {...props}
              selectedTaskId={selectedTask}
              setSelectedTask={setSelectedTask}
              onExpanderClick={handleExpanderClick}
            />
          )}
        />
      </div>
    </div>
  )
}

// Цвета для статусов задач
function getTaskColor(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "#10b981" // green
    case "IN_PROGRESS":
      return "#3b82f6" // blue
    case "REVIEW":
      return "#f59e0b" // amber
    case "ON_HOLD":
      return "#6b7280" // gray
    case "CANCELLED":
      return "#ef4444" // red
    default:
      return "#94a3b8" // slate
  }
}

// Цвета для приоритетов
function getProgressColor(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "#dc2626" // red-600
    case "HIGH":
      return "#f59e0b" // amber-500
    case "MEDIUM":
      return "#3b82f6" // blue-500
    case "LOW":
      return "#10b981" // green-500
    default:
      return "#6b7280" // gray-500
  }
}
