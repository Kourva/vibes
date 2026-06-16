<template>
  <div class="layout-wrapper">
    <!-- Top Glassy Separated Header Group -->
    <GlassHeader 
      :profile="profile" 
      :active="true" 
      @back="goBack"
      @search="onSearchClicked"
      @more="onMoreClicked"
    />
    <div class="header-shadow-fade" aria-hidden="true"></div>

    <!-- Main Page Content Slot (renders ChatBubbles & GlassBottom) -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'
import { useRouter } from '#imports'

const router = useRouter()
const { profile, triggerToast } = useChat()

const goBack = () => {
  router.push('/')
}

const onSearchClicked = () => {
  triggerToast("In-chat keyword filtering is under construction!")
}

const onMoreClicked = () => {
  triggerToast("Advanced settings drawer coming soon 🛠️")
}
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.header-shadow-fade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 86px;
  background: linear-gradient(to bottom, #0d101a 0%, rgba(13, 16, 26, 0.95) 20%, rgba(13, 16, 26, 0.45) 60%, rgba(13, 16, 26, 0) 100%);
  z-index: 4;
  pointer-events: none;
}
</style>
