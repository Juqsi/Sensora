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
import { toast } from 'vue-sonner'
import { getLanguage, SupportedLanguages } from '@/composables/useLanguage.ts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const { t, locale } = useI18n()

const selectedLanguage = getLanguage()

const updateLanguage = (newLanguage: string) => {
  if (locale.value !== newLanguage) {
    localStorage.setItem('language', newLanguage)
    locale.value = newLanguage
    document.documentElement.setAttribute('lang', newLanguage)

    toast.success(
      newLanguage === SupportedLanguages.EN
        ? t('language.SetToEnglish')
        : t('language.SetToGerman'),
    )
  }
}
</script>

<template>
  <div class="w-full px-8 pb-8">
    <h3 class="text-xl  font-medium leading-none">{{ t('language.LanguageSelectionTitle') }}</h3>

    <form>
      <FormField v-slot="{ componentField }" name="language" type="radio">
        <FormItem class="space-y-1 my-4">
          <FormMessage />

          <RadioGroup
            :default-value="selectedLanguage"
            class="grid max-w-md grid-cols-2 gap-8 pt-2"
            v-bind="componentField"
            @update:modelValue="updateLanguage"
          >
            <FormItem>
              <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                <FormControl>
                  <RadioGroupItem :value="SupportedLanguages.EN" class="sr-only" />
                </FormControl>
                <div class="items-center rounded-md border-2 p-1 hover:border-accent">
                  <div class="space-y-2 rounded-sm bg-card-foreground p-2">
                    <div
                      class="flex items-center justify-center space-x-2 rounded-md bg-card p-2 shadow-xs"
                    >
                      <!-- Flag Icon for English -->
                      <div class="flag-icon flag-icon-us w-8 h-8"></div>
                      <div class="text-card-foreground">English</div>
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
                  <div class="space-y-2 rounded-sm bg-card-foreground p-2">
                    <div
                      class="flex items-center justify-center space-x-2 rounded-md bg-card p-2 shadow-xs"
                    >
                      <!-- Flag Icon for German -->
                      <div class="flag-icon flag-icon-de w-8 h-8"></div>
                      <div class="text-card-foreground">Deutsch</div>
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
    </form>
  </div>
</template>
