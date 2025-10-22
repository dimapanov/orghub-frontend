import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Plus, FolderPlus, Info } from "lucide-react"
import type { Task } from "./types"
import type { TaskGroup } from "../../types"
import { useState, useRef, useEffect } from "react"
import { TaskEditPopover } from "./task-edit-popover"
import { TaskGroupPopover } from "./task-group-popover"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableTaskItem } from "./sortable-task-item"

interface TasksPageProps {
  tasks: Task[]
  taskGroups?: TaskGroup[]
  onReorder?: (tasks: Task[]) => void
  onToggleStatus?: (taskId: string) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onCreateTask?: (taskData: Partial<Task> & { title: string }) => Promise<any>
  onCreateTaskGroup?: (groupData: { name: string; description?: string; color?: string }) => Promise<any>
  onUpdateTaskGroup?: (groupId: string, updates: { name?: string; description?: string; color?: string }) => Promise<any>
  onDeleteTaskGroup?: (groupId: string) => Promise<any>
  onDeleteTask?: (taskId: string) => Promise<any>
}

// Компонент для droppable зоны группы
function DroppableTaskGroup({
  group,
  groupId,
  groupName,
  groupDescription,
  tasks,
  onToggleStatus,
  onUpdate,
  onAddSubtask,
  onUpdateGroup,
  onDeleteGroup,
  onDeleteTask,
  dropPosition,
  activeTaskId,
}: {
  group?: TaskGroup
  groupId: string | null
  groupName: string
  groupDescription?: string | null
  tasks: Task[]
  onToggleStatus?: (taskId: string) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onAddSubtask?: (parentId: string, taskData: Partial<Task> & { title: string }) => Promise<any>
  onUpdateGroup?: (groupId: string, updates: { name?: string; description?: string; color?: string }) => Promise<any>
  onDeleteGroup?: (groupId: string) => Promise<any>
  onDeleteTask?: (taskId: string) => Promise<any>
  dropPosition?: 'top' | 'center' | 'bottom' | null
  activeTaskId?: string | null
}) {
  const { setNodeRef } = useDroppable({
    id: `group-${groupId || "ungrouped"}`,
    data: { groupId, type: 'group' },
  })

  // Отдельный droppable для заголовка группы
  const { setNodeRef: setHeaderRef, isOver: isOverHeader } = useDroppable({
    id: `group-header-${groupId || "ungrouped"}`,
    data: { groupId, type: 'group-header' },
  })

  // Фильтруем только задачи верхнего уровня (без родителя)
  const topLevelTasks = tasks.filter((task) => !task.parentId)

  return (
    <div
      ref={setNodeRef}
      className="space-y-3 min-h-[100px] rounded-lg transition-colors"
    >
      <div
        ref={setHeaderRef}
        className={`pb-2 border-b group/header transition-colors ${
          isOverHeader ? "bg-primary/10 ring-2 ring-primary rounded-md px-2 py-1 -mx-2 -my-1 mb-1" : ""
        }`}
      >
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h6 className="font-semibold text-base">
              {groupName}
            </h6>
            <span className="text-xs text-muted-foreground">
              ({tasks.filter((t) => t.status === "COMPLETED").length}/{tasks.length})
            </span>
          </div>
          {group && onUpdateGroup && (
            <TaskGroupPopover
              group={group}
              onUpdate={onUpdateGroup}
              onDelete={onDeleteGroup}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover/header:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </div>
        {groupDescription && (
          <p className="text-xs text-muted-foreground mt-1">
            {groupDescription}
          </p>
        )}
      </div>
      <SortableContext items={topLevelTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {topLevelTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Перетащите задачи сюда
            </p>
          ) : (
            topLevelTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onUpdate={onUpdate}
                onAddSubtask={onAddSubtask}
                onDelete={onDeleteTask}
                dropPosition={dropPosition}
                activeTaskId={activeTaskId}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function TasksPage({ tasks, taskGroups = [], onReorder, onToggleStatus, onUpdate, onCreateTask, onCreateTaskGroup, onUpdateTaskGroup, onDeleteTaskGroup, onDeleteTask }: TasksPageProps) {
  const [showNewTaskPopover, setShowNewTaskPopover] = useState(false)
  const [showNewGroupPopover, setShowNewGroupPopover] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'top' | 'center' | 'bottom' | null>(null)
  const currentMouseY = useRef<number>(0)

  // Отслеживаем позицию мыши во время перетаскивания
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      currentMouseY.current = e.clientY
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleCreateTask = async (taskData: Partial<Task> & { title: string }) => {
    if (!onCreateTask) return

    try {
      await onCreateTask(taskData)
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleAddSubtask = async (parentId: string, taskData: Partial<Task> & { title: string }) => {
    if (!onCreateTask) return

    try {
      await onCreateTask({
        ...taskData,
        parentId,
      })
    } catch (error) {
      console.error("Failed to create subtask:", error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event

    if (!over || !active) {
      setDropPosition(null)
      return
    }

    // Если наведение на группу или заголовок - не определяем позицию
    const overId = over.id as string
    if (overId.startsWith('group-')) {
      setDropPosition(null)
      return
    }

    // Получаем элемент, над которым находимся
    const overElement = document.querySelector(`[data-id="${overId}"]`)
    if (!overElement) {
      setDropPosition(null)
      return
    }

    const rect = overElement.getBoundingClientRect()
    const mouseY = currentMouseY.current

    // Определяем позицию в элементе
    // Увеличиваем центральную зону для более удобного создания вложенности
    const elementHeight = rect.height
    const relativeY = mouseY - rect.top
    const threshold = elementHeight * 0.2 // 20% сверху и снизу для линий вставки

    if (relativeY < threshold) {
      setDropPosition('top')
    } else if (relativeY > elementHeight - threshold) {
      setDropPosition('bottom')
    } else {
      // 60% центральная зона для создания подзадачи
      setDropPosition('center')
    }
  }

  // Вспомогательная функция для вычисления уровня вложенности задачи
  const getTaskDepth = (taskId: string, tasks: Task[]): number => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !task.parentId) return 0
    return 1 + getTaskDepth(task.parentId, tasks)
  }

  // Вспомогательная функция для получения всех задач (включая вложенные)
  const getAllTasks = (tasks: Task[]): Task[] => {
    const result: Task[] = []
    const addTasksRecursively = (taskList: Task[]) => {
      taskList.forEach(task => {
        result.push(task)
        if (task.children && task.children.length > 0) {
          addTasksRecursively(task.children)
        }
      })
    }
    addTasksRecursively(tasks)
    return result
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)
    const currentDropPosition = dropPosition
    setDropPosition(null)

    if (!over || !onUpdate) return

    const taskId = active.id as string
    const allTasks = getAllTasks(tasks)
    const task = allTasks.find((t) => t.id === taskId)
    if (!task) return

    // Проверяем, куда перетащили задачу
    const overId = over.id as string

    // Если перетащили на группу или заголовок группы
    if (overId.startsWith("group-header-") || overId.startsWith("group-")) {
      const targetGroupId = overId.includes("ungrouped")
        ? null
        : overId.replace("group-header-", "").replace("group-", "")

      // Если группа изменилась ИЛИ задача была подзадачей
      if (task.taskGroupId !== targetGroupId || task.parentId) {
        onUpdate(taskId, { taskGroupId: targetGroupId, parentId: null })
      }
    }
    // Если перетащили на другую задачу
    else if (overId !== taskId) {
      const targetTask = allTasks.find((t) => t.id === overId)

      if (targetTask) {
        // Проверяем, не пытаемся ли мы сделать задачу подзадачей самой себя
        if (taskId === overId) return

        // Если перетаскивают НАД или ПОД задачей (не в центр)
        if (currentDropPosition === 'top' || currentDropPosition === 'bottom') {
          // Делаем задачу того же уровня, что и целевая
          // Если целевая задача - подзадача, новая тоже становится подзадачей того же родителя
          // Если целевая задача - верхнего уровня, новая тоже становится верхнего уровня
          if (task.parentId !== targetTask.parentId || task.taskGroupId !== targetTask.taskGroupId) {
            onUpdate(taskId, {
              parentId: targetTask.parentId || null,
              taskGroupId: targetTask.taskGroupId
            })
          }
          return
        }

        // Если перетаскивают В ЦЕНТР задачи - создаем вложенность

        // Проверяем, не является ли целевая задача потомком перемещаемой задачи
        const isDescendant = (parentId: string, childId: string): boolean => {
          const child = allTasks.find(t => t.id === childId)
          if (!child) return false
          if (child.parentId === parentId) return true
          if (child.parentId) return isDescendant(parentId, child.parentId)
          return false
        }

        if (isDescendant(taskId, overId)) {
          console.warn('Нельзя сделать задачу подзадачей своего потомка')
          return
        }

        // Вычисляем уровень вложенности целевой задачи
        const targetDepth = getTaskDepth(overId, allTasks)

        // Проверяем, не превысит ли новая вложенность максимум (2 уровня)
        if (targetDepth >= 2) {
          console.warn('Достигнут максимальный уровень вложенности (2 уровня)')
          return
        }

        // Делаем задачу подзадачей целевой задачи
        onUpdate(taskId, {
          parentId: overId,
          taskGroupId: targetTask.taskGroupId
        })
      } else if (onReorder) {
        // Если не нашли целевую задачу, используем старую логику изменения порядка
        const oldIndex = tasks.findIndex((t) => t.id === taskId)
        const newIndex = tasks.findIndex((t) => t.id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newTasks = [...tasks]
          const [movedTask] = newTasks.splice(oldIndex, 1)
          newTasks.splice(newIndex, 0, movedTask)

          // Обновляем orderIndex для всех задач
          const reorderedTasks = newTasks.map((t, index) => ({
            ...t,
            orderIndex: index,
          }))

          onReorder(reorderedTasks)
        }
      }
    }
  }

  const handleCreateGroup = async (groupData: { name: string; description?: string; color?: string }) => {
    if (!onCreateTaskGroup) return

    try {
      await onCreateTaskGroup(groupData)
    } catch (error) {
      console.error("Failed to create task group:", error)
    }
  }

  const handleUpdateGroup = async (groupId: string, updates: { name?: string; description?: string; color?: string }) => {
    if (!onUpdateTaskGroup) return

    try {
      await onUpdateTaskGroup(groupId, updates)
    } catch (error) {
      console.error("Failed to update task group:", error)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!onDeleteTaskGroup) return

    try {
      await onDeleteTaskGroup(groupId)
    } catch (error) {
      console.error("Failed to delete task group:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!onDeleteTask) return

    try {
      await onDeleteTask(taskId)
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  // Группируем задачи по группам
  const tasksByGroup = new Map<string | null, Task[]>()

  // Инициализируем группы из taskGroups
  taskGroups.forEach(group => {
    tasksByGroup.set(group.id, [])
  })

  // Добавляем группу для задач без группы
  tasksByGroup.set(null, [])

  // Распределяем задачи по группам
  tasks.forEach(task => {
    const groupId = task.taskGroupId || null
    const groupTasks = tasksByGroup.get(groupId) || []
    groupTasks.push(task)
    tasksByGroup.set(groupId, groupTasks)
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Все задачи</CardTitle>
            <CardDescription>
              {tasks.filter((t) => t.status === "COMPLETED").length} из{" "}
              {tasks.length} выполнено
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onCreateTaskGroup && (
              <TaskGroupPopover
                open={showNewGroupPopover}
                onOpenChange={setShowNewGroupPopover}
                onCreate={handleCreateGroup}
                trigger={
                  <Button variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Новая группа
                  </Button>
                }
              />
            )}
            {onCreateTask && (
              <TaskEditPopover
                open={showNewTaskPopover}
                onOpenChange={setShowNewTaskPopover}
                onCreate={handleCreateTask}
                trigger={
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить задачу
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {/* Сначала показываем группы с задачами */}
            {taskGroups
              .filter(group => (tasksByGroup.get(group.id) || []).length > 0)
              .map(group => (
                <DroppableTaskGroup
                  key={group.id}
                  group={group}
                  groupId={group.id}
                  groupName={group.name}
                  groupDescription={group.description}
                  tasks={tasksByGroup.get(group.id) || []}
                  onToggleStatus={onToggleStatus}
                  onUpdate={onUpdate}
                  onAddSubtask={handleAddSubtask}
                  onUpdateGroup={handleUpdateGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onDeleteTask={handleDeleteTask}
                  dropPosition={dropPosition}
                  activeTaskId={activeTaskId}
                />
              ))}

            {/* Показываем задачи без группы */}
            {(tasksByGroup.get(null) || []).length > 0 && (
              <DroppableTaskGroup
                key="ungrouped"
                groupId={null}
                groupName="Без группы"
                tasks={tasksByGroup.get(null) || []}
                onToggleStatus={onToggleStatus}
                onUpdate={onUpdate}
                onAddSubtask={handleAddSubtask}
                onDeleteTask={handleDeleteTask}
                dropPosition={dropPosition}
                activeTaskId={activeTaskId}
              />
            )}

            {/* Показываем пустые группы */}
            {taskGroups
              .filter(group => (tasksByGroup.get(group.id) || []).length === 0)
              .map(group => (
                <DroppableTaskGroup
                  key={group.id}
                  group={group}
                  groupId={group.id}
                  groupName={group.name}
                  groupDescription={group.description}
                  tasks={[]}
                  onToggleStatus={onToggleStatus}
                  onUpdate={onUpdate}
                  onAddSubtask={handleAddSubtask}
                  onUpdateGroup={handleUpdateGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onDeleteTask={handleDeleteTask}
                  dropPosition={dropPosition}
                  activeTaskId={activeTaskId}
                />
              ))}
          </div>

          <DragOverlay>
            {activeTaskId ? (() => {
              const allTasks = getAllTasks(tasks)
              const activeTask = allTasks.find((t) => t.id === activeTaskId)
              return activeTask ? (
                <div className="opacity-90 rotate-2 scale-105 shadow-xl">
                  <div className="group flex items-start gap-3 p-3 rounded-lg border bg-background cursor-grabbing">
                    <div className="w-5" />
                    <div className="mt-1">
                      <div className="w-4 h-4 rounded border bg-background" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activeTask.title}</h4>
                    </div>
                  </div>
                </div>
              ) : null
            })() : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  )
}
