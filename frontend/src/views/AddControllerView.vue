<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, WifiIcon, LinkIcon, RefreshCwIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isWifiConnected = ref(false);

const confirmWifiConnected = () => {
  isWifiConnected.value = true;
};
</script>

<template>
  <Card class="w-full mx-auto mt-8">
    <CardHeader>
      <CardTitle>{{ t('addController.title') }}</CardTitle>
      <CardDescription>{{ t('addController.description') }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center space-x-2">
        <Info class="h-4 w-4 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">{{ t('addController.important') }}</p>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold">{{ t('addController.step1Title') }}</h3>
        <p class="text-sm">{{ t('addController.step1Description') }}</p>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold">{{ t('addController.step2Title') }}</h3>
        <p class="text-sm">{{ t('addController.step2Description') }}</p>
        <div class="flex items-center space-x-2">
          <WifiIcon class="h-4 w-4 text-primary" />
          <p class="text-sm font-medium">{{ t('addController.wifiName') }}</p>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('addController.wifiPassword') }}</p>
        <Button v-if="!isWifiConnected" @click="confirmWifiConnected" class="w-full">{{ t('addController.confirmWifi') }}</Button>
        <div v-else class="flex items-center space-x-2 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.975 3.975 7.475-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm">{{ t('addController.wifiConnected') }}</p>
        </div>
      </div>

      <div class="space-y-2" v-if="isWifiConnected">
        <h3 class="text-lg font-semibold">{{ t('addController.step3Title') }}</h3>
        <p class="text-sm">{{ t('addController.step3Description') }}</p>
        <div class="flex items-center space-x-2">
          <LinkIcon class="h-4 w-4 text-primary" />
          <p class="text-sm font-medium">192.168.0.1</p>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('addController.step3Hint') }}</p>
        <Button as="a" href="http://192.168.0.1" target="_blank" rel="noopener noreferrer" class="w-full">{{ t('addController.openConfig') }}</Button>
      </div>

      <div class="space-y-2" v-if="isWifiConnected">
        <h3 class="text-lg font-semibold">{{ t('addController.step4Title') }}</h3>
        <p class="text-sm">{{ t('addController.step4Description') }}</p>
      </div>

      <div class="space-y-2" v-if="isWifiConnected">
        <h3 class="text-lg font-semibold">{{ t('addController.step5Title') }}</h3>
        <p class="text-sm">{{ t('addController.step5Description') }}</p>
        <Button as="a" href="/plants" class="w-full">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          {{ t('addController.refreshPlants') }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
