<script lang="ts" setup>
/*
Pflanzennamen
SollWerte -> Template von anderen Pflanzen
Pflanzenart
Notiz
Zimmer
Sensor - wenn vergeben mit pop up von a nach b moven? und bei Liste bei auswahl frei extra icon bzw benutzt icon
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label/index.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input/index.ts'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from 'vue-i18n'
import Selection from '@/components/Selection.vue'

const { t } = useI18n()
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>{{ t('plant.settings.Title') }}</CardTitle>
      <CardDescription>{{ t('plant.settings.SubTitle') }}</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6">
      <div class="grid gap-2">
        <Label for="subject">{{ t('plant.seattings.NameOfPlant') }}</Label>
        <Input id="subject" placeholder="Name der Pflanze" />
      </div>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="room">{{ t('plant.settings.SelectSensor') }}</Label>
          <Selection id="room" />
        </div>
        <div class="grid gap-2">
          <Label for="sensor">{{ t('plant.settings.SelectSensor') }}</Label>
          <Selection id="sensor" class="w-full" />
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Please include all information relevant to your issue."
        />
      </div>
    </CardContent>
    <CardFooter class="justify-between space-x-2">
      <Button variant="ghost"> Cancel</Button>
      <Button>Submit</Button>
    </CardFooter>
  </Card>
</template>

<style scoped></style>
