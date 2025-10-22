import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/shared/ui/badge"
import { Checkbox } from "@/shared/ui/checkbox"
import { Button } from "@/shared/ui/button"
import { formatDate } from "@/shared/lib"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import {
  getPriorityColor,
  getTaskStatusColor,
  getPriorityLabel,
  getTaskStatusLabel,
} from "./utils"
import type { SortableTaskItemProps } from "./types"
import { TaskEditPopover } from "./task-edit-popover"

export function SortableTaskItem({ task, onToggleStatus, onUpdate, onAddSubtask, onDelete, level = 0, dropPosition, activeTaskId }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging, isOver, active } =
    useSortable({
      id: task.id,
      data: {
        type: 'task',
        task,
        level,
      }
    })

  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddSubtaskPopover, setShowAddSubtaskPopover] = useState(false)
  const hasChildren = task.children && task.children.length > 0
  const isCompleted = task.status === "COMPLETED"

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  // Определяем, показывается ли этот элемент как цель
  const isDropTarget = isOver && active && active.id !== task.id && activeTaskId === active.id.toString()

  // Показываем индикатор в зависимости от позиции
  const showTopIndicator = isDropTarget && dropPosition === 'top'
  const showBottomIndicator = isDropTarget && dropPosition === 'bottom'
  const showCenterHighlight = isDropTarget && dropPosition === 'center'

  return (
    <div className="relative">
      {/* Индикатор линии сверху */}
      {showTopIndicator && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10 shadow-[0_0_4px_rgba(var(--primary),0.5)]"
          style={{ marginLeft: `${level * 32}px` }}
        />
      )}

      {/* Индикатор линии снизу */}
      {showBottomIndicator && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10 shadow-[0_0_4px_rgba(var(--primary),0.5)]"
          style={{ marginLeft: `${level * 32}px` }}
        />
      )}

      <div
        ref={setNodeRef}
        style={{
          ...style,
          marginLeft: `${level * 32}px`,
        }}
        data-id={task.id}
        className={`group flex items-start gap-3 py-4 px-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing ${
          isCompleted ? "bg-muted/20 opacity-60" : "bg-background"
        } ${showCenterHighlight ? "ring-2 ring-primary bg-primary/5" : ""}`}
        {...attributes}
        {...listeners}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1 p-0.5 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleStatus?.(task.id)}
            className={`mt-1 ${isCompleted ? "opacity-50" : ""}`}
          />
        </div>

        <div className="flex-1 select-none">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${isCompleted ? "line-through text-muted-foreground/60" : ""}`}>{task.title}</h4>
            <Badge
              variant={isCompleted ? "outline" : (getTaskStatusColor(task.status) as any)}
              className={`text-xs ${isCompleted ? "opacity-50 border-muted-foreground/30 text-muted-foreground" : ""}`}
            >
              {getTaskStatusLabel(task.status)}
            </Badge>
            {task.priority && (
              <Badge
                variant={isCompleted ? "outline" : (getPriorityColor(task.priority) as any)}
                className={`text-xs ${isCompleted ? "opacity-50 border-muted-foreground/30 text-muted-foreground" : ""}`}
              >
                {getPriorityLabel(task.priority)}
              </Badge>
            )}
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                {task.children?.filter(c => c.status === "COMPLETED").length}/{task.children?.length}
              </Badge>
            )}
          </div>
          {task.description && (
            <p className={`text-sm text-muted-foreground line-clamp-1 mb-2 ${isCompleted ? "line-through" : ""}`}>
              {task.description}
            </p>
          )}
          <div className={`flex items-center gap-3 ${isCompleted ? "opacity-60" : ""}`}>
            {task.assignee && (
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium ${isCompleted ? "opacity-60" : ""}`}>
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                  {task.assignee.name}
                </span>
              </div>
            )}
            {task.endDate && (
              <span className={`text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                До {formatDate(task.endDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          {onAddSubtask && level < 2 && (
            <TaskEditPopover
              open={showAddSubtaskPopover}
              onOpenChange={setShowAddSubtaskPopover}
              onCreate={async (taskData) => {
                await onAddSubtask(task.id, taskData)
                setShowAddSubtaskPopover(false)
              }}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          )}
          <TaskEditPopover task={task} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {task.children?.map((subtask) => (
            <SortableTaskItem
              key={subtask.id}
              task={subtask}
              onToggleStatus={onToggleStatus}
              onUpdate={onUpdate}
              onAddSubtask={onAddSubtask}
              onDelete={onDelete}
              level={level + 1}
              dropPosition={dropPosition}
              activeTaskId={activeTaskId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
