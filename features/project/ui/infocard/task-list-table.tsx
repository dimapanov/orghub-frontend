import type { Task as GanttTask } from "gantt-task-react"
import { ChevronDown, ChevronRight } from "lucide-react"

// Кастомный компонент для заголовка списка задач
export const TaskListHeaderDefault = () => {
  return (
    <div
      className="flex items-center justify-start px-4 py-2 border-b bg-gray-50"
      style={{ minHeight: 50 }}
    >
      <div className="font-medium text-sm text-gray-700">Название</div>
    </div>
  )
}

interface TaskListTableProps {
  tasks: GanttTask[]
  rowHeight: number
  rowWidth: string
  locale: string
  selectedTaskId: string
  setSelectedTask: (taskId: string) => void
  onExpanderClick?: (task: GanttTask) => void
}

// Вычисление уровня вложенности задачи
const getTaskLevel = (task: GanttTask, tasks: GanttTask[]): number => {
  let level = 0
  let currentProject = task.project

  while (currentProject) {
    level++
    const parentTask = tasks.find((t) => t.id === currentProject)
    currentProject = parentTask?.project
  }

  return level
}

// Кастомный компонент для строки задачи в списке
export const TaskListTableDefault = ({
  tasks,
  rowHeight,
  rowWidth,
  selectedTaskId,
  setSelectedTask,
  onExpanderClick,
  ...rest
}: TaskListTableProps & Record<string, any>) => {
  // Проверяем, есть ли onExpanderClick в пропсах от библиотеки
  const expanderClickHandler = rest.onExpanderClick || onExpanderClick

  console.log('TaskListTable props:', { ...rest, hasOnExpanderClick: !!expanderClickHandler })

  return (
    <div style={{ width: rowWidth }}>
      {tasks.map((task) => {
        const isSelected = task.id === selectedTaskId
        const level = getTaskLevel(task, tasks)
        const hasChildren = task.type === "project"
        const isExpanded = !task.hideChildren

        return (
          <div
            key={task.id}
            className={`flex items-center border-b hover:bg-gray-50 ${
              isSelected ? "bg-blue-50" : ""
            } ${task.type === "project" ? "font-semibold" : ""}`}
            style={{
              height: rowHeight,
            }}
          >
            {/* Кнопка сворачивания/разворачивания */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 24,
                marginLeft: level * 16 + 8,
              }}
            >
              {hasChildren && expanderClickHandler && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Expander clicked:', task.id, task.name, 'hideChildren:', task.hideChildren)
                    if (expanderClickHandler) {
                      expanderClickHandler(task)
                    }
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Название задачи */}
            <div
              className="flex-1 text-sm truncate px-2 cursor-pointer"
              onClick={() => setSelectedTask(task.id)}
            >
              {task.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
