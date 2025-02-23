<script lang="ts" setup>
import { CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label/index.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input/index.ts'
import { Textarea } from '@/components/ui/textarea/index.ts'
import { useI18n } from 'vue-i18n'
import Selection from '@/components/Selection.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavCard from '@/components/NavCard.vue'

const router = useRouter()
const { t } = useI18n()

const rooms = [
  {
    label: t('plant.settings.Group1'),
    value: 'uuid-1-der-gruppe',
    entity: [
      { label: t('plant.settings.Room1'), value: 'uuid-1-des-raums' },
      { label: t('plant.settings.Room2'), value: 'uuid-2-des-raums' },
    ],
  },
  {
    label: t('plant.settings.Group2'),
    value: 'uuid-2-der-gruppe',
    entity: [
      { label: t('plant.settings.Room3'), value: 'uuid-3-des-raums' },
      { label: t('plant.settings.Room4'), value: 'uuid-4-des-raums' },
    ],
  },
]

const sensors = [
  {
    label: t('plant.settings.Sensors'),
    value: 'uuid-1-des-sensors',
    entity: [
      { label: t('plant.settings.Sensor1'), value: 'uuid-1-des-sensors' },
      { label: t('plant.settings.Sensor2'), value: 'uuid-2-des-sensors' },
    ],
  },
]

const avatars = [
  {
    label: t('plant.settings.Avatars'),
    value: 'uuid-1-des-avatar',
    entity: [
      { label: t('plant.settings.Avatar1'), value: 'uuid-1-des-avatar' },
      { label: t('plant.settings.Avatar2'), value: 'uuid-2-des-avatar' },
    ],
  },
]

const selectedRoom = ref({ label: t('plant.settings.SelectRoom'), value: 'uuid-1-des-raums' })
const selectedSensor = ref({ label: t('plant.settings.SelectSensor'), value: 'uuid-1-des-raums' })

function createRoom() {}
</script>

<template>
  <NavCard :sub-title="t('plant.settings.SubTitle')" :title="t('plant.settings.Title')">
    <CardContent class="grid gap-6">
      <div class="grid gap-2">
        <Label for="subject">{{ t('plant.settings.NameOfPlant') }}</Label>
        <Input id="subject" :placeholder="t('plant.settings.NamePlaceholder')" />
      </div>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="room">{{ t('plant.settings.Room') }}</Label>
          <Selection
            id="room"
            v-model:selectedEntity="selectedRoom"
            :groups="rooms"
            :new-entity-button="true"
            prefix="prefix"
            @createEntity="createRoom"
          />
        </div>
        <div class="grid gap-2">
          <Label for="sensor">{{ t('plant.settings.SelectSensor') }}</Label>
          <Selection
            id="sensor"
            v-model:selectedEntity="selectedSensor"
            :groups="sensors"
            :new-entity-button="false"
            class="w-full"
            prefix="prefix"
          />
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="plantType">{{ t('plant.settings.PlantType') }}</Label>
        <Input id="plantType" :placeholder="t('plant.settings.PlantTypePlaceholder')" />
      </div>

      <div class="grid gap-2">
        <Label for="avatar">{{ t('plant.settings.Avatar') }}</Label>
        <Selection
          id="avatar"
          v-model:selectedEntity="selectedSensor"
          :groups="avatars"
          :new-entity-button="false"
          class="w-full"
          prefix="prefix"
        />
      </div>

      <div class="grid gap-2">
        <Label for="description">{{ t('plant.settings.Description') }}</Label>
        <Textarea id="description" :placeholder="t('plant.settings.DescriptionPlaceholder')" />
      </div>
    </CardContent>
    <CardFooter class="justify-between space-x-2">
      <Button variant="ghost" @click="router.back()">{{ t('plant.settings.Cancel') }}</Button>
      <Button>{{ t('plant.settings.Submit') }}</Button>
    </CardFooter>
  </NavCard>
</template>

<style scoped></style>
