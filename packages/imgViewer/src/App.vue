<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { vscodeApi } from './api/vscode'

const router = useRouter()

onMounted(() => {
  vscodeApi.initVscode()
  vscodeApi.vscode?.postMessage({
    command: 'pageReady'
  })
  window.addEventListener('message', onMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
})

function onMessage(event: MessageEvent) {
  const message = event.data
  if (message.command === 'navigate' && message.data.to) {
    router.push(message.data.to)
  }
}
</script>
