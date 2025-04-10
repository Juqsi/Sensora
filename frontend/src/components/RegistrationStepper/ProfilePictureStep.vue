<script lang="ts" setup>
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UserAvatarRefEnum } from '@/api'
import { useUserStore } from '@/stores'
import { STATICS_PATH } from '@/api/base.ts'
import i18n from '@/i18n'
import { cn } from '@/lib/utils.ts'
import type { HTMLAttributes } from 'vue'

const t = i18n.global?.t || ((key: string) => key)

const props = defineProps<{ nextStep: () => void; class?: HTMLAttributes['class'] }>()

const userStore = useUserStore()
const selectedAvatar = ref<string | undefined>(undefined)
const avatars = Object.values(UserAvatarRefEnum)

const handleSubmit = async () => {
  if (!selectedAvatar.value) return
  try {
    await userStore.updateUser({ avatarRef: selectedAvatar.value as UserAvatarRefEnum })
    props.nextStep()
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <Card :class="cn('mx-auto w-full', props.class)">
    <CardHeader>
      <CardTitle class="text-xl">{{t('register.profilePicture.Description') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit">
        <RadioGroup v-model="selectedAvatar" class="grid grid-cols-4 gap-4">
          <div v-for="avatar in avatars" :key="avatar" class="flex flex-col items-center space-y-2">
            <RadioGroupItem
              :id="`avatar-${avatar}`"
              :value="avatar as string"
              class="peer sr-only"
            />
            <div
              :class="{
                'border-4 border-primary ring-2 ring-green-400': selectedAvatar === avatar,
                'border-gray-300': selectedAvatar !== avatar,
              }"
              class="flex items-center justify-center w-16 h-16 rounded-full cursor-pointer transition-all"
              @click="selectedAvatar = avatar"
            >
              <img :alt="avatar" class="w-15 h-15 rounded-full" :src="STATICS_PATH(avatar)" />
            </div>
            <Label :for="`avatar-${avatar}`" class="text-sm text-center">{{ avatar }}</Label>
          </div>
        </RadioGroup>
        <Button :disabled="!selectedAvatar" class="w-full mt-4" type="submit">{{
          t('register.Continue')
        }}</Button>
      </form>
    </CardContent>
  </Card>
</template>
