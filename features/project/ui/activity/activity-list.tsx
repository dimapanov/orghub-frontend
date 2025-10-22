import { Button } from "@/shared/ui/button"
import type { Activity } from "../../types"

interface ActivityListProps {
  activities: Activity[]
  limit?: number
  onViewAll?: () => void
  variant?: "compact" | "timeline"
}

export function ActivityList({ activities, limit, onViewAll, variant = "compact" }: ActivityListProps) {
  const displayActivities = limit ? activities.slice(0, limit) : activities

  if (activities.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Нет активности
      </p>
    )
  }

  if (variant === "timeline") {
    return (
      <div className="space-y-4">
        {displayActivities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {activity.user.name.charAt(0).toUpperCase()}
                </div>
                {index < displayActivities.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-medium">{activity.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {activity.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
            {activity.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              {activity.action}
            </p>
            {activity.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {activity.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(activity.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
      {limit && activities.length > limit && onViewAll && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onViewAll}
        >
          Показать всю активность
        </Button>
      )}
    </div>
  )
}
