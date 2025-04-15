<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { Check, Circle, Dot } from 'lucide-vue-next'
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const stepIndex = ref(2)

const nextStep = () => {
  if (stepIndex.value < 4) {
    stepIndex.value++
  }
}

const steps = [
  {
    step: 1,
    title: t('setupAccountStepper.1.title'),
    description: t('setupAccountStepper.1.description'),
    component: defineAsyncComponent(
      () => import('@/components/RegistrationStepper/CreateAccountStep.vue'),
    ),
  },
  {
    step: 2,
    title: t('setupAccountStepper.2.title'),
    description: t('setupAccountStepper.2.description'),
    component: defineAsyncComponent(
      () => import('@/components/RegistrationStepper/AccountCompletionStep.vue'),
    ),
  },
  {
    step: 3,
    title: t('setupAccountStepper.3.title'),
    description: t('setupAccountStepper.3.description'),
    component: defineAsyncComponent(
      () => import('@/components/RegistrationStepper/ProfilePictureStep.vue'),
    ),
  },
  {
    step: 4,
    title: t('setupAccountStepper.4.title'),
    description: t('setupAccountStepper.4.description'),
    component: defineAsyncComponent(() => import('@/components/RegistrationStepper/GroupStep.vue')),
  },
]
</script>

<template>
  <Stepper
    v-model="stepIndex"
    class="mx-auto flex w-full max-w-md flex-col justify-start gap-10"
    orientation="vertical"
  >
    <StepperItem
      v-for="(step, index) in steps"
      :key="step.step"
      v-slot="{ state }"
      :step="step.step"
      class="relative flex w-full flex-col items-start gap-4"
    >
      <div v-if="stepIndex !== 1" class="flex items-center gap-4">
        <StepperTrigger as-child>
          <Button
            :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
            :style="{
              pointerEvents: step.step === 1 && state === 'completed' ? 'none' : 'auto',
            }"
            :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
            class="rounded-full shrink-0"
            size="icon"
          >
            <Check v-if="state === 'completed'" class="size-5" />
            <Circle v-if="state === 'active'" />
            <Dot v-if="state === 'inactive'" />
          </Button>
        </StepperTrigger>

        <div class="flex flex-col gap-1">
          <StepperTitle
            :class="[state === 'active' && 'text-primary']"
            class="text-md font-semibold transition lg:text-base"
          >
            {{ step.title }}
          </StepperTitle>
          <StepperDescription
            :class="[state === 'active' && 'text-primary']"
            class="text-xs text-muted-foreground transition lg:text-sm"
          >
            {{ step.description }}
          </StepperDescription>
        </div>
      </div>

      <component class="max-w-md" :is="step.component" v-if="index + 1 == stepIndex" :nextStep="nextStep" />
    </StepperItem>
  </Stepper>
</template>
