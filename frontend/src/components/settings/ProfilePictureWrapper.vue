<script setup lang="ts">

import ProfilePictureStep from '@/components/RegistrationStepper/ProfilePictureStep.vue'
import router from '@/router'
</script>

<template>
<ProfilePictureStep :next-step="()=>{router.back()}" style="margin-top:-2rem" class="border-0 bg-background text-foreground shadow-none"/>
</template>

<style scoped>

</style>
