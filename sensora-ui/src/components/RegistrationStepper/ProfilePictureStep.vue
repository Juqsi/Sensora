<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

defineProps<{ nextStep: () => void }>()
</script>

<template>
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-xl">User Information</CardTitle>
      <CardDescription>Enter your username and full name</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input id="username" placeholder="your_username" required />
        </div>
        <div class="grid gap-2">
          <Label for="first-name">First Name</Label>
          <Input id="first-name" placeholder="John" required />
        </div>
        <div class="grid gap-2">
          <Label for="last-name">Last Name</Label>
          <Input id="last-name" placeholder="Doe" required />
        </div>
        <Button class="w-full" @click="nextStep">Continue</Button>
      </div>
    </CardContent>
  </Card>
</template>
