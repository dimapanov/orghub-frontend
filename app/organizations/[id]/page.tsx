'use client'

import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/features/auth"
import { EntityListLayout } from "@/shared/ui/entity-list-layout"
import { Button } from "@/shared/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProjectCard, LoadingState, ErrorState } from "@/features/dashboard/components"
import { CreateProjectDialog } from "@/features/projects/components"
import { useOrganizationProjects } from "@/features/organizations/hooks/useOrganizationProjects"
import { useOrganization } from "@/features/organizations/hooks/useOrganization"

function OrganizationPageContent() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const { organization, isLoading: orgLoading, error: orgError } = useOrganization(organizationId)
  const { projects, isLoading: projectsLoading, error: projectsError, deleteProject, refetch } = useOrganizationProjects(organizationId)

  const isLoading = orgLoading || projectsLoading
  const error = orgError || projectsError

  if (orgLoading) {
    return <LoadingState />
  }

  if (orgError || !organization) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState error={orgError || "Организация не найдена"} />
      </div>
    )
  }

  return (
    <EntityListLayout
      title={organization.name}
      description={organization.description || "Проекты организации"}
      backButton={
        <Button variant="ghost" onClick={() => router.push('/organizations')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад к организациям
        </Button>
      }
      createButton={
        <CreateProjectDialog organizationId={organizationId} onSuccess={refetch}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать проект
          </Button>
        </CreateProjectDialog>
      }
      isLoading={projectsLoading}
      error={projectsError}
      isEmpty={projects.length === 0}
      loadingState={<LoadingState />}
      errorState={<ErrorState error={projectsError} />}
      emptyState={
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">В этой организации пока нет проектов</p>
          <CreateProjectDialog organizationId={organizationId} onSuccess={refetch}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый проект
            </Button>
          </CreateProjectDialog>
        </div>
      }
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
      ))}
    </EntityListLayout>
  )
}

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <OrganizationPageContent />
    </ProtectedRoute>
  )
}
