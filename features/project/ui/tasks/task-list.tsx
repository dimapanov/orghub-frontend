import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { formatDate } from "@/shared/lib"
import { getPriorityColor, getTaskStatusColor, getPriorityLabel, getTaskStatusLabel } from "./utils"
import type { TaskListProps } from "./types"

export function TaskList({ tasks, limit, onViewAll }: TaskListProps) {
  const displayTasks = limit ? tasks.slice(0, limit) : tasks

  if (tasks.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Задачи ещё не добавлены
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {displayTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start justify-between py-4 px-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{task.title}</h4>
              <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Badge variant={getTaskStatusColor(task.status) as any} className="text-xs">
                {getTaskStatusLabel(task.status)}
              </Badge>
              {task.assignee && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {task.assignee.name}
                  </span>
                </div>
              )}
              {task.dueDate && (
                <span className="text-sm text-muted-foreground">
                  До {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {limit && tasks.length > limit && onViewAll && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onViewAll}>
          Посмотреть все
        </Button>
      )}
    </div>
  )
}
