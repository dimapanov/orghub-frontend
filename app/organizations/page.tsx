'use client'

import { ProtectedRoute } from "@/features/auth"
import { EntityListLayout } from "@/shared/ui/entity-list-layout"
import { Button } from "@/shared/ui/button"
import { Plus } from "lucide-react"
import { useOrganizations } from "@/features/organizations/hooks"
import {
  OrganizationCard,
  CreateOrganizationDialog,
  EmptyState,
  LoadingState,
  ErrorState
} from "@/features/organizations/components"

function OrganizationsContent() {
  const { organizations, isLoading, error, refetch, deleteOrganization } = useOrganizations()

  return (
    <EntityListLayout
      title="Мои организации"
      description="Управляйте организациями, в которых вы состоите"
      createButton={
        <CreateOrganizationDialog onSuccess={refetch}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать организацию
          </Button>
        </CreateOrganizationDialog>
      }
      isLoading={isLoading}
      error={error}
      isEmpty={organizations.length === 0}
      loadingState={<LoadingState />}
      errorState={<ErrorState error={error} onRetry={refetch} />}
      emptyState={<EmptyState onSuccess={refetch} />}
    >
      {organizations.map((organization) => (
        <OrganizationCard
          key={organization.id}
          organization={organization}
          onDelete={deleteOrganization}
        />
      ))}
    </EntityListLayout>
  )
}

export default function OrganizationsPage() {
  return (
    <ProtectedRoute>
      <OrganizationsContent />
    </ProtectedRoute>
  )
}
