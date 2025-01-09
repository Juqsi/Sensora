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
  <Card class="mx-auto max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl"> {{ t('login.SignIn') }}</CardTitle>
      <CardDescription> {{ t('login.SignInInfo') }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">{{ t('login.Email') }}</Label>
          <Input id="email" placeholder="JoeDoe@sensora.de" required type="email" />
        </div>
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">{{ t('login.Password') }}</Label>
            <a class="ml-auto inline-block text-sm underline" href="#">
              {{ t('login.ForgotPassword') }}
            </a>
          </div>
          <Input id="password" required type="password" />
        </div>
        <Button class="w-full" type="submit">{{ t('login.SignIn') }}</Button>

        <Separator :label="t('login.Or')" class="my-4" />

        <Button class="w-full" variant="outline">{{ t('login.SignInWithA') }}</Button>
      </div>
      <div class="mt-4 text-center text-sm">
        {{ t('login.DontHaveAccount') }}
        <router-link :to="{ name: 'register' }" class="underline">
          {{ t('login.SignUp') }}
        </router-link>
      </div>
    </CardContent>
  </Card>
</template>
