<script lang="ts" setup>
import { defineProps, defineEmits,type PropType   } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Droplet, GaugeCircle, Leaf, Ruler, Sparkles, Sun, TreePine } from 'lucide-vue-next'
import type { Plant, Recognition } from '@/composables/useImageUpload.ts'
import EmtyState from '@/components/EmtyState.vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const props = defineProps({ recognition: {type: Object as PropType<Recognition>, required: true}, useUse: {type: Object as PropType<Boolean>, required: false, default: false} })
const emit = defineEmits<{ (e: 'use', plant: Plant): void }>()

function handleUse() {
  emit('use', props.recognition.plant!)
}
</script>

<template>
  <template v-if="props.recognition.plant">
    <Card class="max-w-2xl w-full rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle class="text-2xl font-bold flex justify-between max-w-full">
          <div>{{ props.recognition.plant.common_name }}</div>
          <div>
            {{
              props.recognition.probability
                ? props.recognition.probability.toFixed(2) + '%'
                : ''
            }}
          </div>
        </CardTitle>
        <CardDescription class="text-muted-foreground italic">
          {{ props.recognition.plant.scientific_name }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Grid mit Basisinformationen -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <GaugeCircle class="text-green-600 w-5 h-5" />
            <span><strong>{{t('plantInformation.Cycle')}}:</strong> {{ props.recognition.plant.cycle }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Droplet class="text-blue-500 w-5 h-5" />
            <span><strong>{{t('PlantInformation.Watering')}}:</strong> {{ props.recognition.plant.watering_short }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Sun class="text-yellow-500 w-5 h-5" />
            <span><strong>{{t('PlantInformation.Sun')}}:</strong> {{ props.recognition.plant.sun }}</span>
          </div>
          <div class="flex items-center gap-3">
            <TreePine class="text-emerald-600 w-5 h-5" />
            <span
            ><strong>{{t('PlantInformation.HardinessZone')}}:</strong> {{ props.recognition.plant.hardiness_zone }}</span
            >
          </div>
          <div class="flex items-center gap-3">
            <Leaf class="text-lime-600 w-5 h-5" />
            <span><strong>{{t('PlantInformation.Leaf')}}:</strong> {{ props.recognition.plant.leaf }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Sparkles class="text-purple-500 w-5 h-5" />
            <span><strong>{{t('PlantInformation.GrowthRate')}}:</strong> {{ props.recognition.plant.growth_rate }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Ruler class="text-gray-500 w-5 h-5" />
            <span><strong>{{t('PlantInformation.CareLevel')}}:</strong> {{ props.recognition.plant.care_level }}</span>
          </div>
        </div>

        <Accordion type="multiple" class="mt-4 border-t pt-4" collapsible>
          <AccordionItem value="watering">
            <AccordionTrigger class="flex items-center gap-2">
              <Droplet class="!rotate-0 w-4 h-4" />
              <span>Watering Details</span>
            </AccordionTrigger>
            <AccordionContent class="text-sm text-muted-foreground">
              {{ props.recognition.plant.watering_extended }}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sunlight">
            <AccordionTrigger class="flex items-center gap-2">
              <Sun class="!rotate-0 w-4 h-4" />
              <span>Sunlight Requirements</span>
            </AccordionTrigger>
            <AccordionContent class="text-sm text-muted-foreground">
              {{ props.recognition.plant.sunlight_extended }}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="pruning">
            <AccordionTrigger class="flex items-center gap-2">
              <Leaf class="!rotate-0 w-4 h-4" />
              <span>Pruning Guide</span>
            </AccordionTrigger>
            <AccordionContent class="text-sm text-muted-foreground">
              {{ props.recognition.plant.pruning_extended }}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter class="flex justify-between items-center">
        <CardDescription class="text-center w-full">
          <a
            :href="
              'https://perenual.com/plant-species-database-search-finder/species/' +
              props.recognition.plant.plant_id
            "
            class="text-primary hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {{t('PlantInformation.MoreInformation')}}
          </a>
        </CardDescription>
        <Button v-if="useUse" size="sm" @click="handleUse">
          {{t('PlantInformation.Use')}}
        </Button>
      </CardFooter>
    </Card>
  </template>
  <template v-else>
    <Card class="max-w-2xl w-full rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle class="text-2xl font-bold flex justify-between">
          <div>{{ props.recognition.name.replace('_', ' ') }}</div>
          <div>
            {{
              props.recognition.probability
                ? props.recognition.probability.toFixed(2) + '%'
                : ''
            }}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmtyState :title="t('plant.NoInformationTitle')" :condition="true" :subtitle="t('plant.NoInformationSubtitle')" img-src="/svg/undraw_no-data_ig65.svg" />
      </CardContent>
      <CardFooter v-if="props.recognition.wikipedia">
        <div class="text-center w-full">
          <a :href="props.recognition.wikipedia" class="text-primary hover:underline">
            Wikipedia
          </a>
        </div>
      </CardFooter>
    </Card>
  </template>
</template>

<style scoped></style>
