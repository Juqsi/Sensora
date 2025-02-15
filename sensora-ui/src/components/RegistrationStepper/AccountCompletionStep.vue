<script lang="ts" setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

defineProps<{ nextStep: () => void }>()
</script>

<template>
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-xl">Account Login</CardTitle>
      <CardDescription>Enter your email and password to proceed</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="forename"> 'account.forename' </Label>
          <Input id="forename" placeholder="Max" required type="text" />
        </div>
        <div class="grid gap-2">
          <Label for="surname">'account.surname'</Label>
          <Input id="surname" required type="text" />
        </div>
        <Button class="w-full" @click="nextStep">Continue</Button>
      </div>
    </CardContent>
  </Card>
</template>
