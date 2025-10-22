'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { SecureTokenManager } from "@/shared/lib"
import {
  Building2,
  CheckCircle2,
  Sparkles,
  Users,
  FolderOpen,
  HardDrive,
  Zap,
  Crown,
  Loader2
} from "lucide-react"

interface Plan {
  id: string
  name: string
  description: string
  price: number | null
  features: string[]
  limits: {
    users: number
    projects: number
    storage: number
  }
  recommended: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [organizationName, setOrganizationName] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = SecureTokenManager.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch available plans
    fetchPlans()
  }, [router])

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/onboarding/plans`
      )

      if (!response.ok) throw new Error('Ошибка загрузки тарифов')

      const data = await response.json()
      setPlans(data)

      // Set recommended plan as default
      const recommendedPlan = data.find((p: Plan) => p.recommended)
      if (recommendedPlan) {
        setSelectedPlan(recommendedPlan.id)
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
    }
  }

  const handleCompleteOnboarding = async () => {
    if (!organizationName.trim()) {
      setError("Введите название организации")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = SecureTokenManager.getToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/onboarding/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizationName,
            plan: selectedPlan,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания организации')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Sparkles className="h-8 w-8" />
      case 'starter': return <Zap className="h-8 w-8" />
      case 'professional': return <Crown className="h-8 w-8" />
      case 'enterprise': return <Building2 className="h-8 w-8" />
      default: return <Sparkles className="h-8 w-8" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'text-slate-500'
      case 'starter': return 'text-blue-500'
      case 'professional': return 'text-purple-500'
      case 'enterprise': return 'text-yellow-500'
      default: return 'text-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">Настройка аккаунта</h1>
            <span className="text-sm text-muted-foreground">
              Шаг {step} из 2
            </span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Выберите тарифный план</h2>
              <p className="text-muted-foreground">
                Начните с бесплатного плана или выберите подходящий для вашей команды
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                  } ${plan.recommended ? 'border-primary' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Рекомендуем
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex mx-auto mb-3 ${getPlanColor(plan.id)}`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-center">
                      {plan.price !== null ? (
                        <div>
                          <span className="text-3xl font-bold">₽{plan.price}</span>
                          <span className="text-muted-foreground">/месяц</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-semibold">По запросу</div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.limits.users} пользователей</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.limits.projects} проектов</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>{(plan.limits.storage / 1024).toFixed(0)} ГБ</span>
                      </div>
                    </div>

                    <ul className="space-y-2 pt-4 border-t">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedPlan === plan.id && (
                      <div className="absolute inset-x-4 bottom-4">
                        <div className="bg-primary text-primary-foreground text-center py-2 rounded-md text-sm font-medium">
                          Выбран
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="min-w-[200px]"
              >
                Продолжить
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-8">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-3">Создайте организацию</h2>
              <p className="text-muted-foreground">
                Дайте название вашей организации или команде
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Информация об организации</CardTitle>
                <CardDescription>
                  Вы сможете изменить эти данные позже в настройках
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Название организации</Label>
                  <Input
                    id="org-name"
                    placeholder="Например: Моя компания"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">Выбранный тариф:</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {plans.find(p => p.id === selectedPlan)?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                    >
                      Изменить
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Назад
                </Button>
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading || !organizationName.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Создание...
                    </>
                  ) : (
                    'Завершить настройку'
                  )}
                </Button>
              </CardFooter>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              После создания организации вы сможете пригласить членов команды
              и начать работу с проектами
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
