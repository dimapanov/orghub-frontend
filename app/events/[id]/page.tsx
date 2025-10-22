'use client'

import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    // Redirect to tasks page by default
    router.replace(`/events/${id}/tasks`)
  }, [id, router])

  return null
}
