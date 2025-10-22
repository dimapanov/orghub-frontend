'use client'

import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/features/auth"
import { DashboardHeader } from "@/widgets/header"
import { Button } from "@/shared/ui/button"
import { Plus } from "lucide-react"
import { useProjects } from "./hooks"
import { ProjectCard, EmptyState, LoadingState, ErrorState } from "./components"

function DashboardContent() {
  const router = useRouter()
  const { projects, isLoading, error, deleteProject } = useProjects()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мои проекты</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте своими мероприятиями и проектами
            </p>
          </div>
          <Button
            onClick={() => router.push("/events/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Создать проект
          </Button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
