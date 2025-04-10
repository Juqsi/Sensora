<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import NavCard from '@/components/NavCard.vue'

const { t } = useI18n()
</script>

<template>
  <NavCard :title="t('faq.title')">
    <template #default>
      <div class="space-y-4 px-6 pb-6">
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem value="what-is-this-app">
            <AccordionTrigger>{{ t('faq.q1.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q1.answer') }}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-is-data-organized">
            <AccordionTrigger>{{ t('faq.q2.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q2.answer') }}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="do-i-need-a-sensor">
            <AccordionTrigger>{{ t('faq.q3.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q3.answer') }}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="can-i-invite-others">
            <AccordionTrigger>{{ t('faq.q4.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q4.answer') }}</AccordionContent>
          </AccordionItem>

          <!-- <AccordionItem value="how-does-irrigation-work">
            <AccordionTrigger>{{ t('faq.q5.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q5.answer') }}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="can-i-see-irrigation-history">
            <AccordionTrigger>{{ t('faq.q6.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q6.answer') }}</AccordionContent>
          </AccordionItem> -->

          <AccordionItem value="remote-access">
            <AccordionTrigger>{{ t('faq.q7.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q7.answer') }}</AccordionContent>
          </AccordionItem>

         <!-- <AccordionItem value="notifications">
            <AccordionTrigger>{{ t('faq.q8.question') }}</AccordionTrigger>
            <AccordionContent>{{ t('faq.q8.answer') }}</AccordionContent>
          </AccordionItem> -->
        </Accordion>
      </div>
    </template>
  </NavCard>
</template>
