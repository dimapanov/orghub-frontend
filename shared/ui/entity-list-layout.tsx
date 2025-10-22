import { ReactNode } from 'react'
import { DashboardHeader } from '@/widgets/header'

interface EntityListLayoutProps {
  title: string
  description: string
  createButton: ReactNode
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  loadingState: ReactNode
  errorState: ReactNode
  emptyState: ReactNode
  children: ReactNode
}

export function EntityListLayout({
  title,
  description,
  createButton,
  isLoading,
  error,
  isEmpty,
  loadingState,
  errorState,
  emptyState,
  children,
}: EntityListLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          {createButton}
        </div>

        {isLoading ? (
          loadingState
        ) : error ? (
          errorState
        ) : isEmpty ? (
          emptyState
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
