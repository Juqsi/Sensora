<script setup lang="ts">
import SetupAccountStepperView from '@/views/SetupAccountStepperView.vue'
import TestDia from '@/components/testDia.vue'
import TemperatureConfig from '@/components/TemperatureConfig.vue'
</script>

<template>
  <temperature-config />
  <router-link
    :class="{ 'text-primary': $route.path === '/' }"
    class="flex flex-col items-center"
    to="/signin"
  >
    singin
  </router-link>
  <router-link
    :class="{ 'text-primary': $route.path === '/' }"
    class="flex flex-col items-center"
    to="/signup"
  >
    signup
  </router-link>

  <TestDia />

  <SetupAccountStepperView />
</template>

<style scoped></style>
