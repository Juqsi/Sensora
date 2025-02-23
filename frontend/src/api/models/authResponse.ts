import type { User } from '@/api'

export interface AuthResponse extends User {
  token: string
  active: Boolean
}
