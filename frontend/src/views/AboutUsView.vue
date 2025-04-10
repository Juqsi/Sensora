<script setup>
import { useI18n } from 'vue-i18n'
import NavCard from '@/components/NavCard.vue'

const { t, tm, rt } = useI18n()
</script>

<template>
  <NavCard title="">
    <template #default>
      <div class="flex flex-col items-center pb-6">
        <!-- Logo Section -->
        <div class="mb-8">
          <img alt="Project Logo" class="w-32 h-32 object-contain mx-auto" src="/logo/icon.webp" />
        </div>

        <!-- Project Info Section -->
        <div class="w-full max-w-4xl px-6 sm:px-12">
          <h1 class="text-4xl font-extrabold text-center mb-6">{{ t('about.title') }}</h1>

          <p class="text-lg mb-6 text-center">
            {{ t('about.description') }}
          </p>

          <!-- Team Section -->
          <h2 class="text-2xl font-semibold mb-4">{{ t('about.teamTitle') }}</h2>
          <ul class="list-disc pl-6 mb-8">
            <li v-for="(member, index) in tm('about.teamMembers')" :key="index">
              {{ rt(member) }}
            </li>
          </ul>

          <!-- Project Goal Section -->
          <h2 class="text-2xl font-semibold mb-4">{{ t('about.projectGoalTitle') }}</h2>
          <p class="text-lg mb-6">
            {{ t('about.projectGoalDescription') }}
          </p>

          <!-- Key Features Section -->
          <h3 class="text-xl font-semibold mb-4">{{ t('about.featuresTitle') }}</h3>
          <ul class="list-disc pl-6 mb-6">
            <li v-for="(feature, index) in tm('about.featuresList')" :key="index">
              {{ rt(feature) }}
            </li>
          </ul>

          <!-- Technologies Section -->
          <h2 class="text-2xl font-semibold mb-4">{{ t('about.technologiesTitle') }}</h2>
          <ul class="list-disc pl-6 mb-6">
            <li v-for="(technology, index) in tm('about.technologiesList')" :key="index">
              {{ rt(technology) }}
            </li>
          </ul>

          <!-- Project Outcome Section -->
          <h2 class="text-2xl font-semibold mb-4">{{ t('about.outcomeTitle') }}</h2>
          <p class="text-lg mb-6">
            {{ t('about.outcomeDescription') }}
          </p>

          <!-- Links Section -->
          <div class="flex justify-center space-x-8 mt-8">
            <a
              :href="t('about.githubLink')"
              class="text-primary text-lg"
              target="https://github.com/Juqsi/Sensora"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </template>
  </NavCard>
</template>

<style scoped></style>
