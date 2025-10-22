'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { SecureTokenManager } from "@/shared/lib"
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setVerificationStatus('error')
        setError('Токен подтверждения не найден')
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка подтверждения email')
        }

        // Save token and user data
        if (data.token) {
          SecureTokenManager.setToken(data.token)
        }

        setUserData(data.user)
        setVerificationStatus('success')

        // Redirect to onboarding after 2 seconds
        if (data.needsOnboarding) {
          setTimeout(() => {
            router.push('/onboarding')
          }, 2000)
        }
      } catch (err) {
        setVerificationStatus('error')
        setError(err instanceof Error ? err.message : 'Произошла ошибка при подтверждении email')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Подтверждение Email</CardTitle>
        </CardHeader>
        <CardContent>
          {verificationStatus === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Подтверждаем ваш email адрес...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email успешно подтвержден!</h3>
              <p className="text-muted-foreground mb-6">
                {userData?.name ? `Добро пожаловать, ${userData.name}!` : 'Добро пожаловать в OrgHub!'}
              </p>
              <p className="text-sm text-muted-foreground">
                Вы будете перенаправлены на страницу создания организации...
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/onboarding')}
                  className="w-full"
                >
                  Продолжить настройку
                </Button>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ошибка подтверждения</h3>

              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/register')}
                  className="w-full"
                >
                  Вернуться к регистрации
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      или
                    </span>
                  </div>
                </div>

                <ResendVerificationForm />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResendVerificationForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки письма')
      }

      setMessage({
        type: 'success',
        text: 'Письмо отправлено! Проверьте вашу почту.'
      })
      setEmail("")
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Произошла ошибка'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleResend} className="space-y-3">
      <div className="text-sm text-muted-foreground mb-2">
        Запросить новое письмо подтверждения
      </div>

      <div className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ваш email"
          required
          className="flex-1 px-3 py-2 text-sm border rounded-md"
        />
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription className="text-xs">
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}
