'use client'

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { useProject } from "@/features/project/hooks"
import { ActivityList } from "@/features/project/ui/activity"

export default function ProjectActivityPage() {
  const params = useParams()
  const id = params.id as string

  const { project } = useProject(id)

  if (!project) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>История активности</CardTitle>
        <CardDescription>Все действия в проекте</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityList activities={project.activities} variant="timeline" />
      </CardContent>
    </Card>
  )
}
