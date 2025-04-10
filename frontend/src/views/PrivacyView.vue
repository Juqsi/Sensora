<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import NavCard from '@/components/NavCard.vue'

const { t } = useI18n()
</script>

<
<template>
  <div class="max-w-3xl mx-auto mt-10 px-4 space-y-6">
    <NavCard :title="t('privacy.title')">
      <template #default>
        <div class="px-6 pb-6 space-y-6 text-sm leading-relaxed">
          <p>{{ t('privacy.intro') }}</p>

          <div>
            <h3 class="text-xl font-semibold mb-2">{{ t('privacy.dataCollected.title') }}</h3>
            <ul class="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>{{ t('privacy.dataCollected.username') }}</li>
              <li>{{ t('privacy.dataCollected.plantData') }}</li>
              <li>{{ t('privacy.dataCollected.sensorData') }}</li>
              <li>{{ t('privacy.dataCollected.usageData') }}</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-2">{{ t('privacy.usage.title') }}</h3>
            <p>{{ t('privacy.usage.text') }}</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-2">{{ t('privacy.access.title') }}</h3>
            <p>{{ t('privacy.access.text') }}</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-2">{{ t('privacy.security.title') }}</h3>
            <p>{{ t('privacy.security.text') }}</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-2">{{ t('privacy.contact.title') }}</h3>
            <p>
              {{ t('privacy.contact.text') }}
              <br />
              <a
                href="mailto:kontakt@justilian.de"
                class="text-primary underline underline-offset-2 hover:opacity-80"
              >
                kontakt@justilian.de
              </a>
            </p>
          </div>
        </div>
      </template>
    </NavCard>
  </div>
</template>
