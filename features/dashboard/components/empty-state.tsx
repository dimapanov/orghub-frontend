'use client'

import { Card, CardContent } from "@/shared/ui/card"
import { Calendar } from "lucide-react"

interface EmptyStateProps {
  onSuccess?: () => void
}

export function EmptyState({}: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent className="pt-6">
        <div className="text-muted-foreground mb-4">
          <div className="rounded-full bg-muted p-6 mb-4 w-fit mx-auto">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Пока нет проектов
          </h3>
          <p className="mb-6">Создайте свой первый проект, чтобы начать работу</p>
        </div>
      </CardContent>
    </Card>
  )
}
