import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid('Ungültige ID'),
  username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  avatarRef: z.string().url('Ungültige URL').optional(),
})

export function validateUser(data: unknown) {
  return UserSchema.safeParse(data)
}
