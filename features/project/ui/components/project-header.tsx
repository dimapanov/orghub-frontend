'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { getStatusColor, getStatusLabel } from "@/shared/lib"
import type { DetailedProject } from "../../types"

interface ProjectHeaderProps {
  project: DetailedProject
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад к проектам
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant={getStatusColor(project.status) as any}>
              {getStatusLabel(project.status)}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
