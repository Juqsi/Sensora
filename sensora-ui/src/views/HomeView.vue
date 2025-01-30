<script lang="ts" setup>
import TemperatureConfig from '@/components/TemperatureConfig.vue'
import TestDia from '@/components/testDia.vue'
import Test from '@/views/test.vue'
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

  <Test />
</template>
