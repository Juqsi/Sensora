<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UserAvatarRefEnum } from '@/api'
import { useUserStore } from '@/stores'

const props = defineProps<{ nextStep: () => void }>()

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
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-xl">User Information</CardTitle>
      <CardDescription>Choose your profile avatar</CardDescription>
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
              @click="selectedAvatar = avatar"
              class="flex items-center justify-center w-16 h-16 rounded-full cursor-pointer transition-all"
            >
              <img
                src="https://avatars.githubusercontent.com/u/91261422?v=4&size=64"
                :alt="avatar"
                class="w-15 h-15 rounded-full"
              />
            </div>
            <Label :for="`avatar-${avatar}`" class="text-sm text-center">{{ avatar }}</Label>
          </div>
        </RadioGroup>
        <Button class="w-full mt-4" type="submit" :disabled="!selectedAvatar">Continue</Button>
      </form>
    </CardContent>
  </Card>
</template>
