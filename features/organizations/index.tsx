'use client'

import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/features/auth"
import { DashboardHeader } from "@/widgets/header"
import { Button } from "@/shared/ui/button"
import { Plus } from "lucide-react"
import { useOrganizations } from "./hooks"
import { OrganizationCard, EmptyState, LoadingState, ErrorState } from "./components"

function OrganizationsContent() {
  const router = useRouter()
  const { organizations, isLoading, error, refetch, deleteOrganization } = useOrganizations()

  const handleCreateOrganization = () => {
    // TODO: Открыть модальное окно или страницу создания организации
    router.push("/organizations/create")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы с кнопкой создания */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мои организации</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте организациями, в которых вы состоите
            </p>
          </div>
          <Button
            onClick={handleCreateOrganization}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Создать организацию
          </Button>
        </div>

        {/* Отображение состояний: загрузка, ошибка, пустой список или список организаций */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : organizations.length === 0 ? (
          <EmptyState onCreateClick={handleCreateOrganization} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                onDelete={deleteOrganization}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrganizationsPage() {
  return (
    <ProtectedRoute>
      <OrganizationsContent />
    </ProtectedRoute>
  )
}
