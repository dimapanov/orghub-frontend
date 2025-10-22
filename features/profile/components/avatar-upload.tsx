'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Camera, X } from 'lucide-react'

interface AvatarUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  name: string
}

export function AvatarUpload({ value, onChange, name }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        {preview ? (
          <AvatarImage src={preview} alt={name} />
        ) : (
          <AvatarFallback className="text-2xl">
            {getInitials(name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Загрузить фото
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="flex items-center gap-2 text-destructive"
          >
            <X className="h-4 w-4" />
            Удалить фото
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG или GIF. Максимум 5MB.
        </p>
      </div>
    </div>
  )
}
