'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4 mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Регистрация успешна!</CardTitle>
          <CardDescription>
            Осталось подтвердить ваш email адрес
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary p-6 rounded-lg text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Проверьте вашу почту</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Мы отправили письмо с подтверждением на:
            </p>
            <p className="font-mono font-semibold text-primary">
              {email || 'ваш email адрес'}
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Откройте письмо и нажмите на кнопку подтверждения, чтобы активировать ваш аккаунт.
            </p>
            <p>
              После подтверждения вы сможете:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Создать вашу организацию</li>
              <li>Выбрать подходящий тарифный план</li>
              <li>Начать работу с проектами</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              Не получили письмо?
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Проверьте папку "Спам" или "Промоакции"</li>
              <li>• Убедитесь, что email указан правильно</li>
              <li>• Подождите несколько минут</li>
              <li>• Попробуйте запросить письмо повторно</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Письмо действительно в течение 24 часов. Если срок истек,
              вы можете запросить новое письмо при попытке входа.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
