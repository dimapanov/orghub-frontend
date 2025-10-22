import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { Button } from "@/shared/ui/button"

interface ErrorStateProps {
  error: string | null
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка загрузки</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error || 'Произошла неизвестная ошибка'}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Попробовать снова
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
