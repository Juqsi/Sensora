<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores'
import { UserAvatarRefEnum } from '@/api'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const userStore = useUserStore()

const props = defineProps<{ nextStep: () => void }>()

const firstname = ref(userStore.user?.firstname ?? '')
const lastname = ref(userStore.user?.lastname ?? '')
const username = ref(userStore.user?.username ?? '')
const email = ref(userStore.user?.mail ?? '')

const handleSubmit = async () => {
  if (!firstname.value.trim()) {
    toast.warning(t('formErrors.firstnameRequired'))
    return
  }
  if (!username.value.trim()) {
    toast.warning(t('formErrors.usernameRequired'))
    return
  }
  if (!email.value.trim()) {
    toast.warning(t('formErrors.emailRequired'))
    return
  }

  try {
    await userStore.updateUser({
      firstname: firstname.value,
      lastname: lastname.value,
      username: username.value,
      mail: email.value,
    })
    props.nextStep()
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="w-full px-8 pb-8">
    <h3 class="text-xl  font-medium leading-none">{{ t('Account.AccountDescription') }}</h3>

    <form @submit.prevent="handleSubmit" class="grid pt-4 gap-4">
      <div class="grid gap-2">
        <Label for="firstname" >{{ t('Account.FirstName') }}*</Label>
        <Input id="firstname" v-model="firstname" />
      </div>

      <div class="grid gap-2">
        <Label for="lastname">{{ t('Account.Surname') }}</Label>
        <Input id="lastname" v-model="lastname" />
      </div>

      <div class="grid gap-2">
        <Label for="username">{{ t('Account.Username') }}*</Label>
        <Input id="username" v-model="username" />
      </div>

      <div class="grid gap-2">
        <Label for="email">{{ t('Account.Email') }}*</Label>
        <Input id="email" type="email" v-model="email" />
      </div>

      <Button type="submit" class="w-full">{{ t('Account.SaveChanges') }}</Button>
    </form>
  </div>
</template>
