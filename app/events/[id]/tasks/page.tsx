'use client'

import { useParams } from "next/navigation"
import { useProject } from "@/features/project/hooks"
import { TasksPage } from "@/features/project/ui/tasks"

export default function ProjectTasksPage() {
  const params = useParams()
  const id = params.id as string

  const {
    project,
    updateTask,
    reorderTasks,
    toggleTaskStatus,
    createTask,
    createTaskGroup,
    updateTaskGroup,
    deleteTaskGroup,
    deleteTask
  } = useProject(id)

  if (!project) return null

  return (
    <TasksPage
      tasks={project.tasks}
      taskGroups={project.taskGroups}
      onReorder={reorderTasks}
      onToggleStatus={toggleTaskStatus}
      onUpdate={updateTask}
      onCreateTask={createTask}
      onCreateTaskGroup={createTaskGroup}
      onUpdateTaskGroup={updateTaskGroup}
      onDeleteTaskGroup={deleteTaskGroup}
      onDeleteTask={deleteTask}
    />
  )
}
