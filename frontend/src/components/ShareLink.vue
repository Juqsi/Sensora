<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Link } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  link: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  title: { type: String, required: true },
});

const emit = defineEmits(['generate']);

function copyText() {
  navigator.clipboard
    .writeText(props.link)
    .then(() => {
      toast.success(t('ShareLink.Copied'))
    })
    .catch((err) => {
      toast.error(t('ShareLink.ErrorCopy'))
    })
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="icon" variant="ghost" @click.stop.prevent>
        <Link class="text-primary" />
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
        <DialogDescription>
          {{ props.description }}
        </DialogDescription>
      </DialogHeader>
      <div v-if="link" class="flex items-center space-x-2">
        <div class="grid flex-1 gap-2">
          <Label class="sr-only" for="link"> Link </Label>
          <Input id="link" v-model="props.link" readonly />
        </div>
        <Button class="px-3" size="sm" type="submit" @click="copyText">
          <span class="sr-only">{{ t('shareLink.copy') }}</span>
          <Copy class="w-4 h-4" />
        </Button>
      </div>
      <DialogFooter class="sm:justify-between gap-2">
        <DialogClose as-child>
          <Button type="button" variant="secondary"> {{ t('shareLink.close') }}</Button>
        </DialogClose>
          <Button v-if="!link"@click="$emit('generate')" type="button"> {{ t('ShareLink.Generate') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
