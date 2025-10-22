import Link from "next/link"
import { CheckSquare, Users, Activity as ActivityIcon, Calendar, DollarSign } from "lucide-react"

type TabType = "tasks" | "infocard" | "team" | "activity" | "budget"

interface ProjectTabsProps {
  activeTab: TabType
  projectId: string
}

export function ProjectTabs({ activeTab, projectId }: ProjectTabsProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "tasks", label: "Задачи", icon: <CheckSquare className="h-4 w-4" /> },
    { id: "infocard", label: "Инфокарта", icon: <Calendar className="h-4 w-4" /> },
    { id: "budget", label: "Бюджет", icon: <DollarSign className="h-4 w-4" /> },
    { id: "team", label: "Команда", icon: <Users className="h-4 w-4" /> },
    { id: "activity", label: "Активность", icon: <ActivityIcon className="h-4 w-4" /> },
  ]

  return (
    <div className="mb-6 border-b">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/events/${projectId}/${tab.id}`}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
