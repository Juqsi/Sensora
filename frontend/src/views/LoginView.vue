<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.ts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuthLoginBody } from '@/api'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = t('login.toast.MissingCredentials')
    return
  }

  loading.value = true
  errorMessage.value = null

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmail = emailRegex.test(email.value)
  try {
    const credentials: AuthLoginBody = {
      mail: isEmail ? email.value : undefined,
      username: isEmail ? undefined : email.value,
      password: password.value,
    }
    await auth.login(credentials)
    router.push({ name: 'home' })
  } catch (error) {
    errorMessage.value = t('login.Failed') // Fehlermeldung anzeigen
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <Card class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-2xl"> {{ t('login.SignIn') }}</CardTitle>
        <CardDescription> {{ t('login.SignInInfo') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="handleSubmit">
          <div class="grid gap-2">
            <Label for="email">{{ t('login.Email') }}</Label>
            <Input id="email" v-model="email" placeholder="JoeDoe@sensora.de" required />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">{{ t('login.Password') }}</Label>
              <a class="ml-auto inline-block text-sm underline" href="#">
                {{ t('login.ForgotPassword') }}
              </a>
            </div>
            <Input id="password" v-model="password" required type="password" />
          </div>

          <Button :disabled="loading" class="w-full" type="submit">
            <span v-if="loading">{{ t('login.Loading') }}</span>
            <span v-else>{{ t('login.SignIn') }}</span>
          </Button>
        </form>

        <div class="mt-4 text-center text-sm">
          {{ t('login.DontHaveAccount') }}
          <router-link :to="{ name: 'register' }" class="underline">
            {{ t('login.SignUp') }}
          </router-link>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
