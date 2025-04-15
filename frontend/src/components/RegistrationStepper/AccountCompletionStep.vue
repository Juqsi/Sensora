<script lang="ts" setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const { t } = useI18n()

const props = defineProps<{ nextStep: () => void }>()

const forename = ref(userStore.user?.firstname)
const surname = ref(userStore.user?.lastname)

async function handleSubmit() {
  try {
    await userStore.updateUser({ firstname: forename.value, lastname: surname.value })
    props.nextStep()
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <Card class="mx-auto w-full">
    <CardHeader>
      <CardTitle class="text-xl">{{t('account.Login')}}</CardTitle>
      <CardDescription>{{t('account.LoginDescription')}}</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="forename"> {{ t('account.forename') }}* </Label>
            <Input id="forename" v-model="forename" type="text" />
          </div>
          <div class="grid gap-2">
            <Label for="surname">{{ t('account.surname') }}</Label>
            <Input id="surname" v-model="surname" type="text" />
          </div>
          <Button class="w-full" type="submit">{{ t('register.Continue') }}</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
