import type { Response } from 'express'
import { ApiError } from '@/utils/ApiError.ts'

export function handleApiError(res: Response, error: any) {
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message, details: error.details })
  } else {
    res.status(500).json({ message: 'Interner Serverfehler', details: error.message })
  }
}
