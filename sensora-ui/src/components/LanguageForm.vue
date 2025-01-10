<script lang="ts" setup>
import 'flag-icon-css/css/flag-icons.min.css'

import { useI18n } from 'vue-i18n'
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
import { toast } from 'vue-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { getLanguage, SupportedLanguages } from '@/composables/useLanguage.ts'

const { t, locale } = useI18n()

const languageFormSchema = toTypedSchema(
  z.object({
    language: z.enum(
      Object.values(SupportedLanguages) as [SupportedLanguages, ...SupportedLanguages[]],
      {
        required_error: 'Please select a language.',
      },
    ),
  }),
)

const { handleSubmit } = useForm({
  validationSchema: languageFormSchema,
  initialValues: {
    language: getLanguage(),
  },
})

const onSubmit = handleSubmit((values) => {
  const language: SupportedLanguages = values.language as SupportedLanguages

  const oldLanguage = getLanguage()
  if (oldLanguage === language) {
    return
  }
  localStorage.setItem('language', language)
  locale.value = language

  if (language === 'en-US') {
    toast.success(t('language.SetToEnglish'))
  } else {
    toast.success(t('language.SetToGerman'))
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">{{ t('language.LanguageSelectionTitle') }}</h3>
    <p class="text-sm text-muted-foreground">
      {{ t('language.LanguageSelectionDescription') }}
    </p>
  </div>
  <Separator />

  <form @submit.prevent="onSubmit">
    <FormField v-slot="{ componentField }" name="language" type="radio">
      <FormItem class="space-y-1">
        <FormLabel>{{ t('language.LanguageLabel') }}</FormLabel>
        <FormDescription> {{ t('language.LanguageDescription') }}</FormDescription>
        <FormMessage />

        <RadioGroup class="grid max-w-md grid-cols-2 gap-8 pt-2" v-bind="componentField">
          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem :value="SupportedLanguages.EN" class="sr-only" />
              </FormControl>
              <div class="items-center rounded-md border-2 p-1 hover:border-accent">
                <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div
                    class="flex items-center justify-center space-x-2 rounded-md bg-white p-2 shadow-sm"
                  >
                    <!-- Flag Icon for English -->
                    <div class="flag-icon flag-icon-us w-8 h-8"></div>
                    <div>English</div>
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal">{{
                t('language.English')
              }}</span>
            </FormLabel>
          </FormItem>

          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem :value="SupportedLanguages.DE" class="sr-only" />
              </FormControl>
              <div class="items-center rounded-md border-2 p-1 hover:border-accent">
                <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div
                    class="flex items-center justify-center space-x-2 rounded-md bg-white p-2 shadow-sm"
                  >
                    <!-- Flag Icon for German -->
                    <div class="flag-icon flag-icon-de w-8 h-8"></div>
                    <div>Deutsch</div>
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal">{{
                t('language.German')
              }}</span>
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit">
        {{ t('language.UpdateLanguage') }}
      </Button>
    </div>
  </form>
</template>
