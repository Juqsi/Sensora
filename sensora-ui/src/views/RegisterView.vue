<script lang="ts" setup>
import CreateAccountStep from '@/components/RegistrationStepper/CreateAccountStep.vue'
import router from '@/router'

const nextStep = () => {
  router.push({ path: '/setupAccount' })
}
</script>

<template>
  <CreateAccountStep :next-step="nextStep"> </CreateAccountStep>
</template>
