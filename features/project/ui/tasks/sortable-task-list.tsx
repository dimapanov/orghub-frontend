import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Button } from "@/shared/ui/button"
import type { SortableTaskListProps } from "./types"
import { SortableTaskItem } from "./sortable-task-item"

export function SortableTaskList({
  tasks,
  limit,
  onViewAll,
  onReorder,
  enableReordering = false,
  onToggleStatus,
  onUpdate,
  onAddSubtask,
}: SortableTaskListProps) {
  const [items, setItems] = useState(tasks)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Синхронизируем внутреннее состояние с props
  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Требуется переместить на 8px для активации
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)

      // Обновляем orderIndex для всех задач
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        orderIndex: index,
      }))

      // Обновляем локальное состояние
      setItems(reorderedItems)

      // Вызываем callback если он предоставлен (вне setState!)
      if (onReorder) {
        onReorder(reorderedItems)
      }
    }
  }

  // Фильтруем только задачи верхнего уровня (без родителя)
  const topLevelTasks = items.filter((task) => !task.parentId)

  // Разделяем задачи на активные и завершенные
  const activeTasks = topLevelTasks.filter((task) => task.status !== "COMPLETED")
  const completedTasks = topLevelTasks.filter((task) => task.status === "COMPLETED")

  const displayActiveTasks = limit ? activeTasks.slice(0, limit) : activeTasks
  const displayCompletedTasks = limit ? completedTasks.slice(0, Math.max(0, limit - displayActiveTasks.length)) : completedTasks

  if (tasks.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Задачи ещё не добавлены
      </p>
    )
  }

  if (!enableReordering) {
    // Если перетаскивание отключено, используем обычный список
    return (
      <div className="space-y-3">
        {displayActiveTasks.map((task) => (
          <SortableTaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} onUpdate={onUpdate} onAddSubtask={onAddSubtask} />
        ))}
        {displayCompletedTasks.length > 0 && (
          <>
            {displayActiveTasks.length > 0 && <div className="border-t pt-3 mt-3" />}
            <div className="space-y-3">
              {displayCompletedTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} onUpdate={onUpdate} onAddSubtask={onAddSubtask} />
              ))}
            </div>
          </>
        )}
        {limit && tasks.length > limit && onViewAll && (
          <Button variant="ghost" size="sm" className="w-full mt-3" onClick={onViewAll}>
            Посмотреть все
          </Button>
        )}
      </div>
    )
  }

  // Объединяем для DnD контекста (активные + завершенные)
  const allDisplayTasks = [...displayActiveTasks, ...displayCompletedTasks]

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={allDisplayTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {displayActiveTasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} onUpdate={onUpdate} onAddSubtask={onAddSubtask} />
          ))}
        </div>
        {displayCompletedTasks.length > 0 && (
          <>
            {displayActiveTasks.length > 0 && <div className="border-t pt-3 mt-3" />}
            <div className="space-y-3">
              {displayCompletedTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} onUpdate={onUpdate} onAddSubtask={onAddSubtask} />
              ))}
            </div>
          </>
        )}
      </SortableContext>

      <DragOverlay>
        {activeId ? (() => {
          const activeTask = allDisplayTasks.find((t) => t.id === activeId)
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

      {limit && tasks.length > limit && onViewAll && (
        <Button variant="ghost" size="sm" className="w-full mt-3" onClick={onViewAll}>
          Посмотреть все
        </Button>
      )}
    </DndContext>
  )
}
