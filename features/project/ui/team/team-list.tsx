import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import type { ProjectMember } from "../../types"

interface TeamListProps {
  members: ProjectMember[]
  limit?: number
  onViewAll?: () => void
  variant?: "compact" | "grid"
}

export function TeamList({ members, limit, onViewAll, variant = "compact" }: TeamListProps) {
  const displayMembers = limit ? members.slice(0, limit) : members

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-4 rounded-lg border"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
              {member.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{member.user.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {member.user.email}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {member.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayMembers.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {member.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{member.user.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {member.role}
            </p>
          </div>
        </div>
      ))}
      {limit && members.length > limit && onViewAll && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onViewAll}
        >
          Показать всех ({members.length})
        </Button>
      )}
    </div>
  )
}
