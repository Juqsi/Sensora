// validation/PlantValidation.ts
import { z } from 'zod'

export const plantValidationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'plant.error.name.min' })
    .max(100, { message: 'plant.error.name.max' }),

  species: z
    .string()
    .min(3, { message: 'plant.error.species.min' })
    .max(100, { message: 'plant.error.species.max' }),

  waterNeed: z.enum(['hoch', 'mittel', 'gering'], {
    message: 'plant.error.waterNeed.valid',
  }),

  sunlightNeed: z.enum(['viel', 'wenig'], {
    message: 'plant.error.sunlightNeed.valid',
  }),

  temperatureRange: z
    .string()
    .regex(/^\d{2}-\d{2}°C$/, { message: 'plant.error.temperatureRange.invalid' }),

  lastWatered: z.date().refine((date) => date <= new Date(), {
    message: 'plant.error.lastWatered.futureDate',
  }),

  userId: z.string().nonempty({ message: 'plant.error.userId.required' }),
})

export const validatePlant = (plant: unknown) => {
  try {
    return plantValidationSchema.parse(plant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map((e) => e.message).join(', '))
    }
    throw error
  }
}
