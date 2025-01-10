<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <Card class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl">{{ t('login.SignUp') }}</CardTitle>
        <CardDescription>{{ t('login.SignUpInfo') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="first-name">{{ t('login.FirstName') }}</Label>
              <Input id="first-name" placeholder="Max" required />
            </div>
            <div class="grid gap-2">
              <Label for="last-name">{{ t('login.LastName') }}</Label>
              <Input id="last-name" placeholder="Robinson" required />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="email">{{ t('login.Email') }}</Label>
            <Input id="email" placeholder="JohnDoe@sensora.de" required type="email" />
          </div>
          <div class="grid gap-2">
            <Label for="password">{{ t('login.Password') }}</Label>
            <Input id="password" type="password" />
          </div>
          <Button class="w-full" type="submit"> {{ t('login.CreateAccount') }}</Button>

          <Separator :label="t('login.Or')" class="my-4" />

          <Button class="w-full" variant="outline"> {{ t('login.SignUpWithA') }}</Button>
        </div>
        <div class="mt-4 text-center text-sm">
          {{ t('login.AlreadyHaveAccount') }}
          <router-link :to="{ name: 'login' }" class="underline">
            {{ t('login.SignIn') }}
          </router-link>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
