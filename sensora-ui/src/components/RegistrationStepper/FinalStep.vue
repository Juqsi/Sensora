<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-xl">Final Step</CardTitle>
      <CardDescription>Complete any remaining setup</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <Button class="w-full">Finish</Button>
      </div>
    </CardContent>
  </Card>
</template>
