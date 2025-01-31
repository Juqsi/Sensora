<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { Check, Circle, Dot } from 'lucide-vue-next'
import { ref, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginStep from '@/components/RegistrationStepper/LoginStep.vue'

const { t } = useI18n()
const stepIndex = ref(1)

const nextStep = () => {
  console.log('hier')
  if (stepIndex.value < 3) {
    stepIndex.value++
  }
}

const steps = [
  {
    step: 1,
    title: 'Your details',
    description:
      'Provide your name and email address. We will use this information to create your account',
    component: defineAsyncComponent(() => import('@/components/RegistrationStepper/LoginStep.vue')),
  },
  {
    step: 2,
    title: 'Company details',
    description: 'A few details about your company will help us personalize your experience',
    component: defineAsyncComponent(
      () => import('@/components/RegistrationStepper/UserInfoStep.vue'),
    ),
  },
  {
    step: 3,
    title: 'Invite your team',
    description:
      'Start collaborating with your team by inviting them to join your account. You can skip this step and invite them later',
    component: defineAsyncComponent(() => import('@/components/RegistrationStepper/FinalStep.vue')),
  },
]
</script>

<template>
  <Stepper
    orientation="vertical"
    class="mx-auto flex w-full max-w-md flex-col justify-start gap-10"
    v-model="stepIndex"
  >
    <StepperItem
      v-for="(step, index) in steps"
      :key="step.step"
      v-slot="{ state }"
      class="relative flex w-full flex-col gap-4"
      :step="step.step"
    >
      <div class="flex items-start gap-4">
        <StepperTrigger as-child>
          <Button
            :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
            size="icon"
            class="rounded-full shrink-0"
            :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
          >
            <Check v-if="state === 'completed'" class="size-5" />
            <Circle v-if="state === 'active'" />
            <Dot v-if="state === 'inactive'" />
          </Button>
        </StepperTrigger>

        <div class="flex flex-col gap-1">
          <StepperTitle
            :class="[state === 'active' && 'text-primary']"
            class="text-sm font-semibold transition lg:text-base"
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

      <component :is="step.component" :nextStep="nextStep" v-if="index + 1 == stepIndex" />
    </StepperItem>
  </Stepper>
</template>
