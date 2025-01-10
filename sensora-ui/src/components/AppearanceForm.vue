<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'

const { theme, setTheme, setOSTheme } = useTheme()

const appearanceFormSchema = toTypedSchema(
  z.object({
    theme: z.enum(['light', 'dark', 'os'], {
      required_error: 'Please select a theme.',
    }),
  }),
)

const { handleSubmit } = useForm({
  validationSchema: appearanceFormSchema,
  initialValues: {
    theme: theme.value,
  },
})

const onSubmit = handleSubmit((values) => {
  if (values.theme === 'os') {
    setOSTheme() // Setze das OS-Theme
    toast.success(`Appearance set to OS preference`)
  } else {
    setTheme(values.theme) // Globales Theme setzen
    toast.success(`Appearance switched to ${values.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}`)
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Appearance</h3>
    <p class="text-sm text-muted-foreground">
      Customize the appearance of the app. Automatically switch between day and night themes.
    </p>
  </div>
  <Separator />

  <form @submit.prevent="onSubmit">
    <FormField v-slot="{ componentField }" name="theme" type="radio">
      <FormItem class="space-y-1">
        <FormLabel>Theme</FormLabel>
        <FormDescription> Select the theme for the dashboard.</FormDescription>
        <FormMessage />

        <RadioGroup class="grid max-w-md grid-cols-3 gap-8 pt-2" v-bind="componentField">
          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem class="sr-only" value="light" />
              </FormControl>
              <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                  <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-2 w-20 rounded-lg max-w-full bg-[#ecedef]" />
                    <div class="h-2 w-[100px] rounded-lg max-w-full bg-[#ecedef]" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal"> Light </span>
            </FormLabel>
          </FormItem>
          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem class="sr-only" value="dark" />
              </FormControl>
              <div
                class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground"
              >
                <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-2 w-20 max-w-full rounded-lg bg-slate-400" />
                    <div class="h-2 w-[100px] max-w-full rounded-lg bg-slate-400" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-slate-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-slate-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal"> Dark </span>
            </FormLabel>
          </FormItem>
          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem class="sr-only" value="os" />
              </FormControl>
              <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                <div class="space-y-2 rounded-sm bg-gray-300 p-2">
                  <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-2 w-20 rounded-lg max-w-full bg-gray-400" />
                    <div class="h-2 w-[100px] rounded-lg max-w-full bg-gray-400" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-gray-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-gray-400" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-gray-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-gray-400" />
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal"> OS preference </span>
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit"> Update preferences</Button>
    </div>
  </form>
</template>
