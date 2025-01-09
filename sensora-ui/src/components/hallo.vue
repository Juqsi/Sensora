<script lang="ts" setup>
import Plant3d from '@/components/plant3d/plant3d.vue'
import { OnyxButton, OnyxForm, OnyxInput, OnyxStepper } from 'sit-onyx'

const style = { maxWidth: '10rem', display: 'flex', flexDirection: 'column', gap: '1rem' }

const style1 = { display: 'flex', gap: '0.5rem' }
</script>

<template>
  <div>
    <h1>hallo</h1>
  </div>
  <plant3d />
  <OnyxForm :style="style">
    <OnyxInput label="Favorite band" modelValue="Que2en" pattern="[A-Za-z ]+" />
    <OnyxInput label="Favorite password" modelValue="incorrect" type="password" />
    <OnyxStepper :min="0" :modelValue="23" label="Number of hairs" />
    <div :style="style1">
      <OnyxButton label="Reset" mode="outline" type="reset" />
      <OnyxButton formmethod="dialog" label="Submit" type="submit" />
    </div>
  </OnyxForm>
</template>

<style scoped></style>
