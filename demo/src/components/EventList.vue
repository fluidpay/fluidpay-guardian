<script setup lang="ts">
import EventDetails from "@/components/EventDetails.vue";
import {onMounted, reactive, ref} from "vue";
import type {EventWrapper} from "@/types/event";

let events: { [key: string]: Array<EventWrapper> } = reactive({})
let progress = ref(false)

interface GuardianDataResult {
  events: {
    data: {
      type: string,
      action: Record<string, unknown>,
      created_at: number
    }
  }[]
}

declare global {
  interface Window {
    Guardian: { getData: () => Promise<GuardianDataResult> }
  }
}

async function fetchEvents(): Promise<void> {
  let tempEvents: { [key: string]: Array<EventWrapper> } = {}
  const guardianData = await window.Guardian.getData()
  guardianData.events.forEach((e) => {
    if (!tempEvents[e.data.type]) {
      tempEvents[e.data.type] = []
    }
    tempEvents[e.data.type] = [...tempEvents[e.data.type], {
      data: e.data.action,
      created_at: new Date(e.data.created_at).toLocaleString("en-US")
    } as EventWrapper]
  })
  Object.assign(events, tempEvents)
  progress.value = true
  return Promise.resolve()
}

onMounted(async () => {
  await fetchEvents()
})

</script>

<template>
  <div class="event-details">
    <div class="d-flex justify-start">
      <v-btn :flat="true" rounded="lg" @click="fetchEvents" class="refresh-events">Refresh</v-btn>
      <v-spacer />
      <v-progress-circular
          indeterminate
          v-if="progress.value || Object.keys(events).length === 0"
          class="progress-events"
          color="primary"
      ></v-progress-circular>
    </div>
    <div v-for="[key, value] in Object.entries(events).sort(([k1], [k2]) => k1.localeCompare(k2))" >
      <EventDetails :eventType="key" :values="value"/>
      <v-spacer />
    </div>
  </div>
</template>
