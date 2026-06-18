<template>
  <div class="chat-list-container">
    <!-- 1. Scrollable Frosted Chats List -->
    <div class="chats-scroll-viewport" ref="scrollArea">
      
      <!-- Secondary Header: Recent Stories (Shown from the start, no background, flex start scroll) -->
      <div v-if="chats.length > 0 && stories && stories.length > 0" class="top-stories-section" id="top-stories-section">
        <div class="stories-horizontal-scroll">
          <div 
            v-for="story in stories" 
            :key="story.id"
            class="top-story-item bottom-story-item"
            @click="triggerToast(`Viewing ${story.name}'s story...`)"
          >
            <div class="story-avatar-ring">
              <!-- Dynamic Advanced Segmented SVG Ring representing story count & seen state -->
              <svg class="story-svg-ring" viewBox="0 0 100 100">
                <circle
                  v-for="i in story.storiesCount"
                  :key="i"
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  :stroke="i <= story.unseenCount ? 'var(--color-accent-blue)' : 'rgba(255, 255, 255, 0.16)'"
                  stroke-width="5.5"
                  :stroke-dasharray="calculateDasharray(story.storiesCount)"
                  :stroke-dashoffset="calculateDashoffset(story.storiesCount, i - 1)"
                  stroke-linecap="round"
                />
              </svg>
              <div class="story-avatar-inset">
                <img :src="story.image" :alt="story.name" class="story-avatar-img" />
              </div>
            </div>
            <span class="story-avatar-name">{{ story.name }}</span>
          </div>
        </div>
      </div>

      <!-- Truly Empty State if total chats are zero -->
      <div v-if="chats.length === 0" class="chats-empty-state">
        <div class="empty-icon-capsule glass-panel-unified glass-circle-unified">
          <MessageSquare :size="24" class="empty-icon-vibe" />
        </div>
        <p class="empty-title">No conversations yet</p>
        <p class="empty-desc">Your active chats will appear on this screen.</p>
      </div>

      <!-- Scrollable list of filtered chats -->
      <div v-else-if="filteredChats.length > 0" class="chats-list-space">
        <div 
          v-for="chat in filteredChats" 
          :key="chat.id"
          class="chat-row-item ripple-on-click"
          :class="{ 'pinned-chat': chat.pinned }"
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
              <div class="chat-row-name-container">
                <span class="chat-row-name">{{ chat.name }}</span>
                <span v-if="chat.isGroup" class="chat-row-group-pill">
                  <span class="group-pill-dot"></span>
                  <span class="group-pill-text">{{ chat.status }}</span>
                </span>
              </div>
              
              <!-- Capsule style background for Time & Pin info -->
              <div class="chat-meta-right">
                <button 
                  class="pin-toggle-btn" 
                  @click.stop="togglePin(chat.id)"
                  :aria-label="chat.pinned ? 'Unpin chat' : 'Pin chat'"
                  title="Toggle Pin"
                >
                  <Pin :size="12" :class="{ 'is-pinned': chat.pinned }" />
                </button>
                <div class="chat-row-time-capsule" :class="{ 'is-pinned-bg': chat.pinned }">
                  <span class="chat-row-time">{{ getLastMessageTime(chat) }}</span>
                </div>
              </div>
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
                <!-- Small indicator if pinned but not hovered -->
                <Pin v-else-if="chat.pinned" :size="11" class="pin-status-indicator" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gorgeous Empty State if search matches nothing -->
      <div v-else class="chats-empty-state">
        <div class="empty-icon-capsule glass-panel-unified glass-circle-unified">
          <Search :size="24" class="empty-icon-vibe" />
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
import { MessageSquare, Check, CheckCheck, Pin, Search } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'
import type { Chat } from '~/composables/useChat'

const props = defineProps<{
  chats: Chat[]
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()

const { searchQuery, togglePin, stories, storiesMovedToBottom, triggerToast } = useChat()
const scrollArea = ref<HTMLElement | null>(null)

// Calculate Dash properties for multi-story split ring representation
const calculateDasharray = (count: number) => {
  const radius = 44
  const circumference = 2 * Math.PI * radius // ~276.46
  if (count <= 1) {
    return `${circumference}`
  }
  const gap = 14 // Increased gap from 6 to 14 to make story splitting distinct and beautiful!
  const segmentLength = (circumference / count) - gap
  return `${segmentLength} ${gap}`
}

const calculateDashoffset = (count: number, index: number) => {
  const radius = 44
  const circumference = 2 * Math.PI * radius // ~276.46
  // Shift by 90 degrees (~69 pixels on circumference) so segments start at the top
  const baseOffset = circumference / 4
  if (count <= 1) {
    return `${baseOffset}`
  }
  const segmentOffset = -index * (circumference / count)
  return `${segmentOffset + baseOffset}`
}

// Filter and Sort chats: pinned chats are forced to stay strictly on top
const filteredChats = computed(() => {
  let list = props.chats
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(c => c.name.toLowerCase().includes(q))
  }
  return [...list].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0
    const bPinned = b.pinned ? 1 : 0
    return bPinned - aPinned
  })
})

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

/* Scroll Viewport starting beneath the absolute header and exactly constrained in absolute layout */
.chats-scroll-viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 82px 6px 105px 6px; /* Reduced left/right padding to 6px; padded 105px on bottom to clear floating nav */
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
  gap: 2px;
}

/* Individual Glassy Chat Entry Row: No shadows, flat connected telegram layout */
.chat-row-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  gap: 12px;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  box-shadow: none !important;
}

.chat-row-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Different Matte light tint background for pinned chats */
.chat-row-item.pinned-chat {
  background: rgba(36, 129, 204, 0.06);
}

.chat-row-item.pinned-chat:hover {
  background: rgba(36, 129, 204, 0.12);
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
  align-items: center;
  margin-bottom: 2px;
}

.chat-row-name-container {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
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

.chat-row-group-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(52, 199, 89, 0.08);
  border: 1px solid rgba(52, 199, 89, 0.15);
  flex-shrink: 0;
}

.group-pill-dot {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background-color: var(--color-active);
  box-shadow: 0 0 3px var(--color-active);
}

.group-pill-text {
  font-size: 8px;
  font-weight: 600;
  color: var(--color-active);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.chat-meta-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Hover-activated Pin Toggle Button */
.pin-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
  outline: none;
}

.chat-row-item:hover .pin-toggle-btn,
.chat-row-item:focus-within .pin-toggle-btn,
.pin-toggle-btn:focus,
.chat-row-item.pinned-chat .pin-toggle-btn {
  opacity: 1;
}

.pin-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent-blue);
}

.pin-toggle-btn .is-pinned {
  color: var(--color-accent-blue);
  transform: rotate(45deg);
}

/* Capsule style background for time */
.chat-row-time-capsule {
  display: inline-flex;
  align-items: center;
  padding: 2.5px 8.5px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.chat-row-time-capsule.is-pinned-bg {
  background: rgba(36, 129, 204, 0.15);
}

.chat-row-time {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  opacity: 0.85;
  white-space: nowrap;
  line-height: 1;
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
  width: 14px;
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

.pin-status-indicator {
  color: rgba(255, 255, 255, 0.25);
  transform: rotate(45deg);
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

/* Top Scrolling Stories Section (No background, flex-start aligned, spacious) */
.top-stories-section {
  width: 100%;
  margin: 0px 0px 18px 0px;
  padding: 0 4px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
}

.top-stories-section .stories-horizontal-scroll {
  display: flex;
  gap: 10px; /* Reduced gap from 16px to 10px */
  justify-content: flex-start;
  width: 100%;
  overflow-x: auto;
  padding: 4px 2px;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.top-stories-section .stories-horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.bottom-story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;
  width: 60px;
}

.story-avatar-ring {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.story-svg-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bottom-story-item:hover .story-avatar-ring {
  transform: scale(1.08) rotate(4deg);
}

.story-avatar-inset {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(13, 17, 30, 0.95);
  padding: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.story-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.story-avatar-name {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  opacity: 0.9;
}
</style>
