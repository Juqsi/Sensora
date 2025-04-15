<script lang="ts" setup>
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useI18n } from 'vue-i18n'
import { useColorMode } from '@vueuse/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mode = useColorMode()

const { t } = useI18n()
</script>

<template>
  <div class="w-full px-8 pb-8">
    <h3 class="text-xl font-medium">{{ t('appearance.Description') }}</h3>
    <form>
      <FormField v-slot="{ componentField }" name="theme" type="radio">
        <FormItem class="space-y-1">
          <FormMessage />

          <RadioGroup
            :default-value="mode"
            class="grid  grid-cols-3 gap-8 pt-2"
            v-bind="componentField"
          >
            <FormItem @click="mode = 'light'">
              <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                <FormControl>
                  <RadioGroupItem class="sr-only" value="light" />
                </FormControl>
                <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                  <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                    <div class="space-y-2 rounded-md bg-white p-2 shadow-xs">
                      <div class="h-2 w-20 rounded-lg max-w-full bg-[#ecedef]" />
                      <div class="h-2 w-[100px] rounded-lg max-w-full bg-[#ecedef]" />
                    </div>
                    <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                      <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                      <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                    </div>
                    <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                      <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                      <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                    </div>
                  </div>
                </div>
                <span class="block w-full p-2 text-center font-normal">{{
                  t('appearance.Light')
                }}</span>
              </FormLabel>
            </FormItem>
            <FormItem @click="mode = 'dark'">
              <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                <FormControl>
                  <RadioGroupItem class="sr-only" value="dark" />
                </FormControl>
                <div
                  class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent hover:text-accent-foreground"
                >
                  <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                    <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-xs">
                      <div class="h-2 w-20 max-w-full rounded-lg bg-slate-400" />
                      <div class="h-2 w-[100px] max-w-full rounded-lg bg-slate-400" />
                    </div>
                    <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                      <div class="h-4 w-4 rounded-full bg-slate-400" />
                      <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                    </div>
                    <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                      <div class="h-4 w-4 rounded-full bg-slate-400" />
                      <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                    </div>
                  </div>
                </div>
                <span class="block w-full p-2 text-center font-normal">{{
                  t('appearance.Dark')
                }}</span>
              </FormLabel>
            </FormItem>
            <FormItem @click="mode = 'auto'">
              <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                <FormControl>
                  <RadioGroupItem class="sr-only" value="auto" />
                </FormControl>
                <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                  <div class="space-y-2 rounded-sm bg-gray-300 p-2">
                    <div class="space-y-2 rounded-md bg-white p-2 shadow-xs">
                      <div class="h-2 w-20 rounded-lg max-w-full bg-gray-400" />
                      <div class="h-2 w-[100px] rounded-lg max-w-full bg-gray-400" />
                    </div>
                    <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                      <div class="h-4 w-4 rounded-full bg-gray-400" />
                      <div class="h-2 w-[100px] rounded-lg bg-gray-400" />
                    </div>
                    <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                      <div class="h-4 w-4 rounded-full bg-gray-400" />
                      <div class="h-2 w-[100px] rounded-lg bg-gray-400" />
                    </div>
                  </div>
                </div>
                <span class="block w-full p-2 text-center font-normal break-words">{{
                  t('appearance.OSPreference')
                }}</span>
              </FormLabel>
            </FormItem>
          </RadioGroup>
        </FormItem>
      </FormField>
    </form>
  </div>
</template>
