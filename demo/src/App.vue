<script setup lang="ts">
import {onMounted} from 'vue'

let content = {events: [], session_id: ""};

onMounted(() => {
  window.Guardian.getData().then((data: {
    events: []
    session_id: string
  }) => (content = data))
})

</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink
          to="/utm?utm_source=buffer&utm_medium=blog&utm_campaign=2-social-strategies&utm_term=term1&utm_content=blogpost">
        UTM
      </RouterLink>
    </nav>
  </header>
  <main>
    <RouterView/>
    <div>
      <h2>Fields</h2>
      {{ content.events.map((e) => e) }}
    </div>
  </main>
</template>

<style></style>
