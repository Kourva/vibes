<template>
  <div class="layout-wrapper">
    <!-- Top Glassy Separated Header Group -->
    <GlassHeader 
      :active="false" 
      :conversation-count="chats.length"
      @search="toggleSearch"
      @menu="onMenuClicked"
      @more="onMoreClicked"
    />
    <div class="header-shadow-fade" aria-hidden="true"></div>

    <!-- Main Page Content Slot (renders ChatList) -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const { chats, showSearch, triggerToast } = useChat()

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const onMenuClicked = () => {
  triggerToast("Liquid glass context configurations loaded! 🌊")
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
  background: linear-gradient(to bottom, var(--color-bg-dark) 0%, rgba(var(--color-bg-dark-rgb), 0.95) 20%, rgba(var(--color-bg-dark-rgb), 0.45) 60%, rgba(var(--color-bg-dark-rgb), 0) 100%);
  z-index: 4;
  pointer-events: none;
}
</style>
