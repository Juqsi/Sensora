<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from 'vue-i18n'
import type { AuthRegisterBody } from '@/api'
import { authApiClient } from '@/api/clients.ts'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'
import {nextTick} from 'vue'

const props = defineProps<{ nextStep: () => void }>()

const { t } = useI18n()

const username = ref('')
const email = ref('')
const password = ref('')

function validatePassword(password: string): string | null {
  const specialCharacters = /[!"#$%&'()*+,-./:;<=>?[\]^_`{|}~]/
  const uppercaseCharacters = /[A-Z]/

  if (password.length < 8) {
    return 'register.MinLength'
  }
  if (!uppercaseCharacters.test(password)) {
    return 'register.UppercaseRequired'
  }
  if (!specialCharacters.test(password)) {
    return 'register.SpecialCharRequired'
  }

  return null
}

const handleSubmit = async () => {
  const errorMessage = validatePassword(password.value)
  if (errorMessage) {
    toast.warning(t(errorMessage))
    return
  }
  const accountInfos: AuthRegisterBody = {
    username: username.value,
    firstname: username.value,
    mail: email.value,
    password: password.value,
  }
  try {
    await authApiClient.createAccount(accountInfos, {
      meta: {
        successMessage: t('account.AccountCreated'),
      },
    } as CustomAxiosRequestConfig)

    const authStore = useAuthStore()
    authStore.logout()
    await authStore.login({ username: username.value, password: password.value })
    await nextTick(() => {
      props.nextStep()
    });
  } catch (error) {
    password.value = ''
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <Card class="mx-auto w-full">
      <CardHeader>
        <CardTitle class="text-xl">{{ t('login.SignUp') }}</CardTitle>
        <CardDescription>{{ t('login.SignUpInfo') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="username">{{ t('login.username') }}*</Label>
                <Input id="username" v-model="username" placeholder="Joe" required />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="email">{{ t('login.Email') }}*</Label>
              <Input
                id="email"
                v-model="email"
                placeholder="JoeDoe@sensora.de"
                required
                type="email"
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">{{ t('login.Password') }}*</Label>
              <Input id="password" v-model="password" type="password" />
            </div>
            <Button class="w-full" type="submit">{{ t('login.CreateAccount') }}</Button>
          </div>
        </form>
        <div class="mt-4 text-center text-sm">
          {{ t('login.AlreadyHaveAccount') }}
          <RouterLink
            :to="{ name: 'login', query: { redirect: $route.query.redirect } }"
            class="underline"
          >
            {{ t('login.SignIn') }}
          </RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
