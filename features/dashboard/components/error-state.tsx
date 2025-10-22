interface ErrorStateProps {
  error: string | null
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
        {error || 'Произошла неизвестная ошибка'}
      </div>
    </div>
  )
}
