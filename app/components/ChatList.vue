<template>
  <div class="chat-list-container">
    <!-- 1. Scrollable Frosted Chats List -->
    <div class="chats-scroll-viewport" ref="scrollArea">
      <div v-if="filteredChats.length > 0" class="chats-list-space">
        <div 
          v-for="chat in filteredChats" 
          :key="chat.id"
          class="chat-row-item glass-panel-unified ripple-on-click"
          @click="$emit('select', chat.id)"
        >
          <!-- User Profile Avatar with Online Glow Ring -->
          <div class="chat-row-avatar-box">
            <div class="chat-row-avatar" :style="{ background: chat.avatarColor }">
              {{ chat.avatar }}
            </div>
            <span v-if="chat.status === 'online' || chat.status === 'typing...'" class="chat-row-status-dot" :class="{ typing: chat.status === 'typing...' }"></span>
          </div>

          <!-- Chat Meta Information -->
          <div class="chat-row-details">
            <div class="chat-row-header-row">
              <span class="chat-row-name">{{ chat.name }}</span>
              <span class="chat-row-time">{{ getLastMessageTime(chat) }}</span>
            </div>

            <div class="chat-row-preview-row">
              <span v-if="chat.status === 'typing...'" class="chat-row-typing-indicator">
                typing...
              </span>
              <span v-else class="chat-row-preview">
                <span v-if="isLastMessageMe(chat)" class="chat-row-me-prefix">You: </span>
                {{ getLastMessageText(chat) }}
              </span>
              
              <!-- Unread / Status indicators -->
              <div class="indicators-container">
                <span v-if="chat.unreadCount && chat.unreadCount > 0" class="chat-row-unread-badge">
                  {{ chat.unreadCount }}
                </span>
                <span v-else-if="isLastMessageMe(chat)" class="chat-row-status-icon">
                  <CheckCheck v-if="getLastMessageStatus(chat) === 'read'" :size="13" class="status-read" />
                  <Check v-else :size="13" class="status-sent" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gorgeous Empty State if search matches nothing -->
      <div v-else class="chats-empty-state">
        <div class="empty-icon-capsule glass-panel-unified glass-circle-unified">
          <MessageSquare :size="24" class="empty-icon-vibe" />
        </div>
        <p class="empty-title">No conversations found</p>
        <p class="empty-desc">Try search terms that match active contacts.</p>
      </div>

      <!-- Margin filler to let last item clear layout bottom safely -->
      <div class="chats-scroll-spacer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageSquare, Check, CheckCheck } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'
import type { Chat } from '~/composables/useChat'

const props = defineProps<{
  chats: Chat[]
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()

const { searchQuery } = useChat()
const scrollArea = ref<HTMLElement | null>(null)

// Filter chats based on global searchQuery
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return props.chats
  const q = searchQuery.value.toLowerCase().trim()
  return props.chats.filter(c => c.name.toLowerCase().includes(q))
})

// Helper methods to get last message details
const getLastMessage = (chat: Chat) => {
  if (chat.messages.length === 0) return null
  return chat.messages[chat.messages.length - 1]
}

const getLastMessageText = (chat: Chat) => {
  const last = getLastMessage(chat)
  return last ? last.text : 'No messages yet'
}

const getLastMessageTime = (chat: Chat) => {
  const last = getLastMessage(chat)
  return last ? last.time : ''
}

const getLastMessageStatus = (chat: Chat) => {
  const last = getLastMessage(chat)
  return last ? last.status : undefined
}

const isLastMessageMe = (chat: Chat) => {
  const last = getLastMessage(chat)
  return last ? last.sender === 'me' : false
}
</script>

<style scoped>
.chat-list-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  padding-top: 0;
}

/* Scroll Viewport starting beneath the absolute 66px header */
.chats-scroll-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 66px 12px 12px 12px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.chats-scroll-viewport::-webkit-scrollbar {
  width: 5px;
}

.chats-scroll-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.chats-scroll-viewport::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 99px;
  border: none;
}

.chats-scroll-viewport::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.16);
}

.chats-list-space {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Individual Glassy Chat Entry Row */
.chat-row-item {
  display: flex;
  align-items: center;
  padding: 11px 13px;
  border-radius: 16px;
  gap: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.chat-row-item:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.chat-row-avatar-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-row-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.chat-row-status-dot {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 10px;
  height: 10px;
  background-color: var(--color-active);
  border: 1.5px solid rgba(13, 16, 26, 0.95);
  border-radius: 50%;
}

.chat-row-status-dot.typing {
  animation: pulseColor 1.2s infinite ease-in-out;
}

.chat-row-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.chat-row-header-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.chat-row-name {
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-row-time {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  opacity: 0.82;
  white-space: nowrap;
}

.chat-row-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.chat-row-preview {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  line-height: 1.4;
}

.chat-row-me-prefix {
  color: var(--color-accent-blue);
  font-weight: 500;
  font-size: 12.5px;
}

.chat-row-typing-indicator {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-active);
  animation: typingPulse 1.4s infinite ease-in-out;
}

.indicators-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-row-unread-badge {
  background: var(--color-accent-blue);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.chat-row-status-icon {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
}

.status-read {
  color: var(--color-active);
}

.chats-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon-capsule {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  margin-bottom: 12px;
  transition: transform 0.3s;
}

.chats-empty-state:hover .empty-icon-capsule {
  transform: scale(1.05) rotate(4deg);
}

.empty-icon-vibe {
  opacity: 0.8;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 220px;
  line-height: 1.5;
}

.chats-scroll-spacer {
  height: 16px;
}

@keyframes typingPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes pulseColor {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 5px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
</style>
