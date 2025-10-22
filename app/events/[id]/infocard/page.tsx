'use client'

import { useParams } from "next/navigation"
import { useProject } from "@/features/project/hooks"
import { InfoCard } from "@/features/project/ui/infocard"

export default function ProjectInfoCardPage() {
  const params = useParams()
  const id = params.id as string

  const { project, updateTask } = useProject(id)

  if (!project) return null

  return (
    <InfoCard
      tasks={project.tasks}
      taskGroups={project.taskGroups}
      onTaskUpdate={updateTask}
    />
  )
}
