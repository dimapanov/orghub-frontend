'use client'

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Users } from "lucide-react"
import { useProject } from "@/features/project/hooks"
import { TeamList } from "@/features/project/ui/team"

export default function ProjectTeamPage() {
  const params = useParams()
  const id = params.id as string

  const { project } = useProject(id)

  if (!project) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Команда проекта</CardTitle>
            <CardDescription>
              {project.members.length} участник(ов)
            </CardDescription>
          </div>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Добавить участника
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TeamList members={project.members} variant="grid" />
      </CardContent>
    </Card>
  )
}
