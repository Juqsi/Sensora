<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CapturePhotoComponent from '@/components/CapturePhotoComponent.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import PlantSearch from '@/components/PlantSearch.vue'
import PlantInformationList from '@/components/PlantInformationList.vue'
import type { Plant, RecognizedImage } from '@/composables/useImageUpload.ts'
import router from '@/router'
import NavCard from '@/components/NavCard.vue'

const { t } = useI18n()

const recognizedPlants = ref<RecognizedImage[]>([])

// Hilfsfunktion zum Parsen der Hardiness Zone (z.B. "4 - 8")
function parseHardinessZone(zone: string | undefined): number {
  if (!zone) return 6
  const parts = zone.split('-').map(part => parseInt(part.trim(), 10)).filter(n => !isNaN(n))
  if (parts.length === 0) return 6
  if (parts.length === 1) return parts[0]
  return parts.reduce((sum, val) => sum + val, 0) / parts.length
}

// Hilfsfunktion zur Anpassung der Bodenfeuchtigkeit basierend auf der Watering-Angabe
function getMoistureAdjustment(watering: string | undefined): number {
  if (!watering) return 0
  switch (watering.toLowerCase()) {
    case 'high':
      return 5
    case 'low':
      return -5
    default:
      return 0
  }
}

function parseBrightness(sun: string | undefined): number {
  if (!sun) return 10
  const sunLower = sun.toLowerCase()
  if (sunLower.includes('full sun') && sunLower.includes('part shade')) {
    return 11
  } else if (sunLower.includes('full sun')) {
    return 12
  } else if (sunLower.includes('part shade')) {
    return 10
  }
  return 10
}

function handlePlantUsed(plantData: Plant) {
  // Temperatur-Berechnung
  const zoneNumber = parseHardinessZone(plantData.hardiness_zone)
  // Basis: 20°C, Zone 6 entspricht Basis. Für jede Zone oberhalb bzw. unterhalb wird 1°C addiert bzw. subtrahiert.
  let temperature = 20 + (zoneNumber - 6)
  if (plantData.growth_rate) {
    const rate = plantData.growth_rate.toLowerCase()
    if (rate === 'high') {
      temperature += 1
    } else if (rate === 'low') {
      temperature -= 1
    }
  }
  // Bei koniferen Pflanzen (cones === "Yes") wird die Temperatur weiter leicht reduziert.
  if (plantData.cones && plantData.cones.toLowerCase() === 'yes') {
    temperature -= 1
  }

  // Bodenfeuchtigkeit-Berechnung
  let soilMoisture = 30
  if (plantData.care_level) {
    const care = plantData.care_level.toLowerCase()
    if (care === 'high') {
      soilMoisture += 5
    } else if (care === 'low') {
      soilMoisture -= 5
    }
  }
  soilMoisture += getMoistureAdjustment(plantData.watering_short)
  // Volle Sonneneinstrahlung führt zu erhöhter Verdunstung, daher wird ein Zuschlag gegeben.
  if (plantData.sun && plantData.sun.toLowerCase().includes('full sun')) {
    soilMoisture += 5
  }

  // Luftfeuchtigkeit-Berechnung
  let humidity = 50
  if (plantData.growth_rate) {
    const rate = plantData.growth_rate.toLowerCase()
    if (rate === 'high') {
      humidity += 5
    } else if (rate === 'low') {
      humidity -= 5
    }
  }
  if (plantData.care_level) {
    const care = plantData.care_level.toLowerCase()
    if (care === 'high') {
      humidity += 3
    } else if (care === 'low') {
      humidity -= 3
    }
  }

  const brightness = parseBrightness(plantData.sun)

  router.push({
    name: 'createPlant',
    query: {
      commonName: plantData.common_name || '',
      scientificName: plantData.scientific_name || '',
      targetValuesTemperature: temperature,
      targetValuesSoilMoisture: soilMoisture,
      targetValuesHumidity: humidity,
      targetValuesBrightness: brightness,
    }
  })
}

function onUploadComplete(data: RecognizedImage[]) {
  recognizedPlants.value = data.concat(recognizedPlants.value)
}

function onSearchResults(results: RecognizedImage[]) {
  recognizedPlants.value = results
}
</script>

<template>
  <NavCard title="KI erkennung" />
  <div class="p-4">
    <div class="w-full max-w-md bg-background bg-opacity-80 backdrop-blur-md p-6 rounded-xl shadow-lg mx-auto">
      <Tabs default-value="capturePhoto">
        <TabsList class="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="capturePhoto">{{ t('upload.capture') }}</TabsTrigger>
          <TabsTrigger value="uploadImage">{{ t('upload.upload') }}</TabsTrigger>
          <TabsTrigger value="search">{{ t('upload.search') }}</TabsTrigger>
        </TabsList>
        <TabsContent value="capturePhoto">
          <CapturePhotoComponent @uploadComplete="onUploadComplete" />
        </TabsContent>
        <TabsContent value="uploadImage">
          <ImageUpload @uploadComplete="onUploadComplete" />
        </TabsContent>
        <TabsContent value="search">
          <PlantSearch @searchResults="onSearchResults" />
        </TabsContent>
      </Tabs>
    </div>

    <PlantInformationList :plants="recognizedPlants" @plantUsed="handlePlantUsed" />
  </div>
</template>

<style scoped></style>
