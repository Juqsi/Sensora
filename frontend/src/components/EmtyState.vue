<script setup>

const props = defineProps({
  imgSrc: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  condition: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <div
    v-if="condition"
    class="flex justify-center flex-col items-center w-full grow mt-10 py-6"
  >
    <h2 class="mb-4 text-2xl font-semibold text-center">{{ title }}</h2>
    <p class="text-center text-muted-foreground mb-6">{{ subtitle }}</p>
    <img :src="imgSrc" alt="Illustration" class="w-32 h-32 object-contain mb-8" />
  </div>
</template>

<style scoped></style>
