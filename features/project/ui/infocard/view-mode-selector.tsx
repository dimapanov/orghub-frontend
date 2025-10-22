import { ViewMode } from "gantt-task-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

interface ViewModeSelectorProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

const VIEW_MODE_OPTIONS = [
  { value: ViewMode.Hour, label: "Час" },
  { value: ViewMode.QuarterDay, label: "Четверть дня" },
  { value: ViewMode.HalfDay, label: "Половина дня" },
  { value: ViewMode.Day, label: "День" },
  { value: ViewMode.Week, label: "Неделя" },
  { value: ViewMode.Month, label: "Месяц" },
  { value: ViewMode.Year, label: "Год" },
] as const

export function ViewModeSelector({ value, onChange }: ViewModeSelectorProps) {
  const handleValueChange = (newValue: string) => {
    // Преобразуем строку обратно в ViewMode
    const viewMode = Object.values(ViewMode).find((mode) => mode === newValue) as ViewMode
    if (viewMode) {
      onChange(viewMode)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Масштаб:</span>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Выберите масштаб" />
        </SelectTrigger>
        <SelectContent>
          {VIEW_MODE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
