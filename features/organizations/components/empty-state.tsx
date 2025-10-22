import { Building2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { CreateOrganizationDialog } from "./create-organization-dialog"

interface EmptyStateProps {
  onSuccess?: () => void
}

export function EmptyState({ onSuccess }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Нет организаций</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Вы еще не состоите ни в одной организации. Создайте новую организацию или дождитесь
        приглашения.
      </p>
    </div>
  )
}
