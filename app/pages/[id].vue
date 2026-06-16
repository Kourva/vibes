<template>
  <div class="page-container" id="chat-page">
    <!-- 2. Interactive Scrolling Message Viewport -->
    <ChatBubbles 
      :messages="messages" 
      :is-typing="isTyping"
      :emoji-open="emojiOpen"
      @scrollerAttached="onScrollerAttached"
      @reply="setReplyingTo"
      @delete-message="deleteMessage"
      @notify="triggerToast"
    />
    
    <!-- 3. Bottom Glassy Input Controls Group -->
    <div class="bottom-shadow-fade" aria-hidden="true"></div>
    <GlassBottom 
      :replying-to="replyingTo"
      @send="sendMessage" 
      @emoji-toggle="(val) => emojiOpen = val" 
      @cancel-reply="setReplyingTo(null)"
      @notify="triggerToast"
    />
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'
import { useRoute } from 'vue-router'
import { watch, onMounted } from 'vue'

definePageMeta({
  layout: 'chat'
})

const route = useRoute()
const { 
  selectChat, 
  messages, 
  isTyping, 
  emojiOpen, 
  replyingTo,
  sendMessage, 
  setReplyingTo,
  deleteMessage,
  chatContainerRef,
  triggerToast
} = useChat()

// Update active target chat
watch(() => route.params.id, (newId) => {
  if (newId) {
    selectChat(String(newId))
  }
}, { immediate: true })

onMounted(() => {
  if (route.params.id) {
    selectChat(String(route.params.id))
  }
})

const onScrollerAttached = (el: HTMLElement) => {
  chatContainerRef.value = el
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.bottom-shadow-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 115px;
  background: linear-gradient(to top, #0d101a 0%, rgba(13, 16, 26, 0.96) 28%, rgba(13, 16, 26, 0.5) 65%, rgba(13, 16, 26, 0) 100%);
  z-index: 4;
  pointer-events: none;
}
</style>
