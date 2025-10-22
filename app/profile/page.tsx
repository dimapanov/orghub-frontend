'use client'

import { ProtectedRoute } from '@/features/auth'
import { useProfile } from '@/features/profile/hooks'
import { ProfileForm, ChangePasswordForm, DeleteAccountSection } from '@/features/profile/components'
import { Separator } from '@/shared/ui/separator'
import { DashboardHeader } from '@/widgets/header'

function ProfileContent() {
  const { user, isLoading, error, updateProfile, changePassword, deleteAccount } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Загрузка...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-destructive">
              {error || 'Не удалось загрузить профиль'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-2">
            Управляйте настройками вашего профиля и аккаунта
          </p>
        </div>

        <div className="space-y-8">
          <ProfileForm user={user} onSubmit={updateProfile} />

          <Separator />

          <ChangePasswordForm onSubmit={changePassword} />

          <Separator />

          <DeleteAccountSection onDelete={deleteAccount} />
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
