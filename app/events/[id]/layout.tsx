'use client'

import { useParams, usePathname } from "next/navigation"
import { useEffect } from "react"
import * as NProgress from "nprogress"
import { DashboardHeader } from "@/widgets/header"
import { Button } from "@/shared/ui/button"
import { ProgressBar } from "@/shared/ui/progress-bar"
import { useProject, usePrefetchProject } from "@/features/project/hooks"
import { ProjectHeader, ProjectTabs } from "@/features/project/ui/components"

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string

  // Prefetch all project data in background
  usePrefetchProject(id)

  const { project, loading, error } = useProject(id)

  // Show progress bar when loading
  useEffect(() => {
    if (loading) {
      NProgress.start()
    } else {
      NProgress.done()
    }
  }, [loading])

  // Определяем активную вкладку на основе URL
  const getActiveTab = () => {
    const path = pathname
    if (path?.includes('/tasks')) return 'tasks'
    if (path?.includes('/infocard')) return 'infocard'
    if (path?.includes('/budget')) return 'budget'
    if (path?.includes('/team')) return 'team'
    if (path?.includes('/activity')) return 'activity'
    return 'tasks'
  }

  const activeTab = getActiveTab()

  if (loading) {
    return (
      <>
        <ProgressBar />
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Загрузка проекта...</p>
            </div>
          </main>
        </div>
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <ProgressBar />
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-destructive">Ошибка: {error?.message || "Проект не найден"}</p>
              <Button onClick={() => window.history.back()}>Назад</Button>
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <ProgressBar />
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProjectHeader project={project} />
          <ProjectTabs activeTab={activeTab} projectId={id} />
          {children}
        </main>
      </div>
    </>
  )
}
