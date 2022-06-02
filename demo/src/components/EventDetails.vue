<script setup lang="ts">

import type {PropType} from 'vue'
import {defineProps} from 'vue'
import type {EventWrapper} from "@/types/event";


defineProps({
  eventType: {
    type: String,
    required: true
  },
  values: {
    type: Array as PropType<Array<EventWrapper>>,
  }
})

</script>

<template>
  <v-container class="grey lighten-5" :class="eventType">
    <div class="d-flex justify-start">
      <h2>{{ eventType }}</h2>
    </div>
    <v-row>
      <v-col :md="2" class="text-left">
        Created At
      </v-col>
      <v-col :md="10" class="text-center">
        Value
      </v-col>
    </v-row>
    <v-row v-for="(value, name, index) in values" :key="index" no-gutters>
      <v-col :md="2">
        <v-card variant="text">
          {{ value.created_at }}
        </v-card>
      </v-col>
      <v-col class="text-center" :md="10">
        <v-card variant="text" :class="eventType+'_value'">
          {{ Object.values(value.data).join(',') }}
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
