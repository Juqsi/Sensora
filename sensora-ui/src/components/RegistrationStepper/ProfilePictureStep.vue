<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatarRefEnum } from '@/api'

defineProps<{ nextStep: () => void }>()
async function handleSubmit() {}
</script>

<template>
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-xl">User Information</CardTitle>
      <CardDescription>Enter your username and full name</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-3 gap-4" v-for="avatar in UserAvatarRefEnum">
          <AvatarImage src="https://github.com/radix-vue.png " alt="@radix-vue" />
          <AvatarFallback>CN</AvatarFallback>
        </div>
        <Button class="w-full" type="submit">Continue</Button>
      </form>
    </CardContent>
  </Card>
</template>
