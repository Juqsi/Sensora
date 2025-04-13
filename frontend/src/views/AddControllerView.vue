<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Info, WifiIcon, LinkIcon, RefreshCwIcon, Loader2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { useUserStore } from '@/stores'
import NavCard from '@/components/NavCard.vue'
import { Capacitor } from '@capacitor/core';

const { t } = useI18n();
const isWifiConnected = ref(false);
const ssid = ref('');
const wifiPassword = ref('');
const username = ref(useUserStore().user?.username ?? "");
const isSubmitting = ref(false);
const submissionSuccess = ref(false);
const submissionError = ref('');

const confirmWifiConnected = () => {
  isWifiConnected.value = true;
};

const variant = Capacitor.getPlatform() === 'android' ? 'secondary' : 'default';

const submitControllerConfig = async () => {
  isSubmitting.value = true;
  submissionError.value = '';

  if (!ssid.value.trim()) {
    toast.warning(t('addController.formErrors.ssidRequired'))
    isSubmitting.value = false
    return
  }

  if (!wifiPassword.value.trim()) {
    toast.warning(t('addController.formErrors.passwordRequired'))
    isSubmitting.value = false
    return
  }

  if (!username.value.trim()) {
    toast.warning(t('addController.formErrors.usernameRequired'))
    isSubmitting.value = false
    return
  }

  try {
    const response = await fetch('http://192.168.4.1/connectapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ssid: ssid.value,
        password: wifiPassword.value,
        username: username.value,
      }),
    })


    if (response.ok) {
      submissionSuccess.value = true;
      toast.success(t('addController.configSuccess'));
      ssid.value = '';
      wifiPassword.value = '';
      username.value = '';
    } else {
      const errorData = await response.json();
      submissionError.value = t(errorData.message) || t('addController.configErrorGeneric');
      toast.error(t('addController.configError') + (errorData.message ? `: ${errorData.message}` : ''));
    }
  } catch (error: any) {
    console.error('Error sending configuration:', error);
    submissionError.value = t('addController.configErrorConnection');
    toast.error(t('addController.configErrorConnection'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <NavCard :title="t('addController.title')" :sub-title="t('addController.description')" class="w-full mx-auto mt-8">
    <template #default >
      <div class="space-y-4 px-6 pb-6">
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

      <div class="space-y-4" v-if="isWifiConnected && !submissionSuccess">
        <h3 class="text-lg font-semibold">{{ t('addController.step3TitleForm') }}</h3>
        <p class="text-sm">{{ t('addController.step3DescriptionForm') }}</p>
        <div class="grid gap-2" v-if="Capacitor.getPlatform() === 'android'">
          <div class="grid gap-1">
            <Label for="ssid">{{ t('addController.ssidLabel') }}</Label>
            <Input id="ssid" v-model="ssid" :placeholder="t('addController.ssidPlaceholder')" />
          </div>
          <div class="grid gap-1">
            <Label for="wifiPassword">{{ t('addController.wifiPasswordLabel') }}</Label>
            <Input id="wifiPassword" type="password" v-model="wifiPassword" :placeholder="t('addController.wifiPasswordPlaceholder')" />
          </div>
          <div class="grid gap-1">
            <Label for="username">{{ t('addController.usernameLabel') }}</Label>
            <Input id="username" v-model="username" :placeholder="t('addController.usernamePlaceholder')" />
          </div>
          <Button @click="submitControllerConfig" :disabled="isSubmitting" class="w-full">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSubmitting ? t('addController.submitting') : t('addController.submitConfig') }}
          </Button>
          <p v-if="submissionError" class="text-sm text-destructive">{{ submissionError }}</p>
        </div>
        <Button as="a" href="http://192.168.4.1" @click="()=>{submissionSuccess = true;}" target="_blank" rel="noopener noreferrer" :variant="variant" class="w-full">{{ t('addController.openConfig') }}</Button>
      </div>

      <div class="space-y-2" v-if="isWifiConnected && submissionSuccess">
        <h3 class="text-lg font-semibold">{{ t('addController.step4SuccessTitle') }}</h3>
        <p class="text-sm">{{ t('addController.step4SuccessDescription') }}</p>
      </div>

      <div class="space-y-2" v-if="isWifiConnected && (submissionSuccess )">
        <h3 class="text-lg font-semibold">{{ t('addController.step5Title') }}</h3>
        <p class="text-sm">{{ t('addController.step5Description') }}</p>
        <Button as="a" href="/plants?force=true" class="w-full">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          {{ t('addController.refreshPlants') }}
        </Button>
      </div>
      </div>
    </template>
  </NavCard>
</template>
