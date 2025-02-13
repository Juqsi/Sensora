<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from 'vue-i18n'
import type { AuthRegisterBody } from '@/api'
import authApiClient from '@/api/clients.ts'

const props = defineProps<{ nextStep: () => void }>()

const { t } = useI18n()

const username = ref('')
const email = ref('')
const password = ref('')

const handleSubmit = () => {
  const accountInfos: AuthRegisterBody = {
    username: username.value,
    firstname: username.value,
    mail: email.value,
    password: password.value,
  }

  authApiClient.createAccount(accountInfos)

  props.nextStep()
}
</script>

<template>
  <div class="flex items-center justify-center">
    <Card class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl">{{ t('login.SignUp') }}</CardTitle>
        <CardDescription>{{ t('login.SignUpInfo') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="username">{{ t('login.username') }}</Label>
                <Input id="username" v-model="username" placeholder="Max" required />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="email">{{ t('login.Email') }}</Label>
              <Input
                id="email"
                v-model="email"
                placeholder="JohnDoe@sensora.de"
                required
                type="email"
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">{{ t('login.Password') }}</Label>
              <Input id="password" v-model="password" type="password" />
            </div>
            <Button class="w-full" type="submit">{{ t('login.CreateAccount') }}</Button>
          </div>
        </form>
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
