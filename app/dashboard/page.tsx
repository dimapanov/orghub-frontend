'use client'

import { ProtectedRoute } from "@/features/auth"
import { EntityListLayout } from "@/shared/ui/entity-list-layout"
import { Button } from "@/shared/ui/button"
import { Plus } from "lucide-react"
import { useProjects } from "@/features/dashboard/hooks"
import { ProjectCard, EmptyState, LoadingState, ErrorState } from "@/features/dashboard/components"
import { CreateProjectDialog } from "@/features/projects/components"

function DashboardContent() {
  const { projects, isLoading, error, deleteProject, refetch } = useProjects()

  return (
    <EntityListLayout
      title="Мои проекты"
      description="Управляйте своими мероприятиями и проектами"
      createButton={
        <CreateProjectDialog onSuccess={refetch}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать проект
          </Button>
        </CreateProjectDialog>
      }
      isLoading={isLoading}
      error={error}
      isEmpty={projects.length === 0}
      loadingState={<LoadingState />}
      errorState={<ErrorState error={error} />}
      emptyState={<EmptyState onSuccess={refetch} />}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
      ))}
    </EntityListLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
