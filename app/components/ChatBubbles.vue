<template>
  <div class="chat-viewport-wrapper" :class="{ 'emoji-open': emojiOpen, 'has-pinned-bar': !!pinnedMessage, 'has-reply-bar': !!replyingTo }">
    <!-- Dynamic Telegram-style Top Pinned Bar -->
    <Transition name="pin-bar-slide">
      <div v-if="pinnedMessage" class="pinned-message-bar">
        <div class="pin-icon-box">
          <Pin :size="16" class="pin-icon-pulse" />
        </div>
        <div class="pinned-text-area" @click="scrollToMessage(pinnedMessage.id)">
          <div class="pinned-header">Pinned Message</div>
          <div class="pinned-preview-line">
            <template v-if="pinnedMessage.image && !pinnedMessage.text">📷 Photo</template>
            <template v-else>{{ pinnedMessage.text }}</template>
          </div>
        </div>

        <!-- Premium mini image thumbnail inside pinned bar -->
        <div v-if="pinnedMessage.image" class="pinned-mini-thumb" @click="scrollToMessage(pinnedMessage.id)">
          <img :src="pinnedMessage.image" alt="Pinned thumbnail" />
        </div>

        <button class="unpin-action-btn flex-container" @click="pinnedMessage = null" aria-label="Unpin message">
          <X :size="14" />
        </button>
      </div>
    </Transition>

    <div 
      class="messages-scroll-area" 
      ref="scrollArea" 
      @scroll="handleScroll"
      id="chat-messages-container"
    >
      <div class="bubbles-list">
        <!-- Scroll Spacer bottom alignment layout spring -->
        <div class="scroll-spacer"></div>

        <!-- Dynamic Date Segments / Timeline -->
        <div v-for="segment in groupedMessageSegments" :key="segment.date" class="message-segment-group">
          <!-- Perfectly Positioned Sticky Date Card Header -->
          <div class="sticky-date-divider-wrapper">
            <span class="sticky-date-divider-badge">{{ segment.date }}</span>
          </div>

          <!-- Staggered transition list inside date segment -->
          <TransitionGroup name="bubble" tag="div" class="bubbles-wrapper">
            <div 
              v-for="(msg, idx) in segment.messages" 
              :id="'msg-' + msg.id"
              :key="msg.id" 
              :class="[
                'bubble-item', 
                msg.sender,
                { 
                  'menu-active': contextMenu.visible && contextMenu.message?.id === msg.id,
                  'pinned-ref': pinnedMessage?.id === msg.id,
                  'first-of-group': isFirstOfGroup(segment.messages, msg, idx),
                  'last-of-group': isLastOfGroup(segment.messages, msg, idx)
                }
              ]"
            >
              <!-- Beautiful Telegram Avatar slot (only shown in Group chats on LHS other user messages) -->
              <div v-if="activeChat?.isGroup && msg.sender === 'them'" class="bubble-avatar-slot" id="msg-avatar-container">
                <div 
                  v-if="isLastOfGroup(segment.messages, msg, idx)" 
                  class="bubble-avatar-circle"
                  :style="{ background: profile.avatarColor }"
                >
                  {{ profile.avatar }}
                </div>
                <div v-else class="bubble-avatar-spacer"></div>
              </div>

              <!-- Message Bubble Panel -->
              <div 
                class="bubble-glass" 
                :class="[msg.sender, { 'has-image': !!msg.image, 'image-only': !!msg.image && !msg.text }]"
                @click.stop="openContextMenu($event, msg)"
                @contextmenu.stop.prevent="openContextMenu($event, msg)"
              >
                <span class="reflection-glow"></span>
                
                <!-- Display sender's name inside bubble in Group Chat if first of the speaker's sequence -->
                <div 
                  v-if="activeChat?.isGroup && msg.sender === 'them' && isFirstOfGroup(segment.messages, msg, idx) && msg.senderName"
                  class="bubble-sender-name"
                  :style="{ color: getSenderColor(msg.senderName) }"
                >
                  {{ msg.senderName }}
                </div>

                <!-- Telegram-style Reply Header Reference block -->
                <div 
                  v-if="msg.replyTo" 
                  class="reply-ref-card" 
                  :class="msg.replyTo.sender"
                  @click.stop="scrollToMessage(msg.replyTo.id)"
                >
                  <div class="reply-ref-content">
                    <div class="reply-ref-sender" :style="{ color: msg.replyTo.sender === 'them' ? getSenderColor(msg.replyTo.senderName) : '#2481cc' }">{{ msg.replyTo.senderName }}</div>
                    <div class="reply-ref-text">{{ msg.replyTo.text || '📷 Photo' }}</div>
                  </div>
                </div>
                
                <!-- Image attachment container -->
                <div v-if="msg.image" class="bubble-image-container">
                  <img :src="msg.image" alt="Aesthetic artwork" class="bubble-attached-image" @click.stop="openImageFullscreen(msg.image)" />
                </div>

                <div v-if="msg.text" class="bubble-text">{{ msg.text }}</div>
                
                <!-- Metadata & Indicators -->
                <div class="bubble-meta">
                  <span class="bubble-time">{{ msg.time }}</span>
                  <span class="pinned-indicator-inline" v-if="pinnedMessage?.id === msg.id">
                    <Pin :size="10" />
                  </span>
                  
                  <!-- Check icons for my messages -->
                  <span v-if="msg.sender === 'me'" class="status-indicator">
                    <Check v-if="msg.status === 'sent'" class="check-icon" :size="16" />
                    <CheckCheck v-else-if="msg.status === 'read'" class="check-icon read" :size="16" />
                    <Loader v-else-if="msg.status === 'sending'" class="check-icon spin" :size="16" />
                  </span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
 
        <!-- Custom dynamic bottom spacer to perfectly clear the glass input and elements below without relying on CSS padding inside display: flex -->
        <div class="bottom-clear-spacer"></div>
      </div>
    </div>
 
    <!-- Layer overlay to safely dismantle active context menus on blank click -->
    <div v-if="contextMenu.visible" class="context-overlay" @click="closeContextMenu"></div>

    <!-- Telegram Ultimate Glass Context Menu -->
    <Transition name="menu-zoom">
      <div 
        v-if="contextMenu.visible" 
        class="telegram-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <button class="menu-item" @click="handleReply">
          <CornerUpLeft :size="16" class="menu-icon" />
          <span>Reply</span>
        </button>
        <button class="menu-item" @click="handleCopy">
          <Copy :size="16" class="menu-icon" />
          <span>Copy</span>
        </button>
        <button class="menu-item" @click="handlePin">
          <Pin :size="16" class="menu-icon" />
          <span>Pin</span>
        </button>
        <div class="menu-divider"></div>
        <button class="menu-item text-danger" @click="handleDelete">
          <Trash2 :size="16" class="menu-icon text-danger-icon" />
          <span>Delete</span>
        </button>
      </div>
    </Transition>

    <!-- Scroll & Frosted Down FAB (Symmetrically aligned on top of the Send button) -->
    <Transition name="fab-slide">
      <button 
        v-if="showScrollFab" 
        class="scroll-down-fab glass-panel-unified glass-circle-unified"
        @click="scrollToBottom"
        aria-label="Scroll to bottom"
        id="btn-scroll-bottom"
      >
        <span class="icon-container">
          <ArrowDown :size="19" />
        </span>
      </button>
    </Transition>

    <!-- High-fidelity Lightbox Image Fullscreen Slider / Viewer Overlay -->
    <Transition name="fade">
      <div v-if="fullscreenImage" class="image-lightbox-overlay" @click="closeImageFullscreen">
        <button class="lightbox-close-btn flex-container" @click="closeImageFullscreen" aria-label="Close Preview">
          <X :size="24" />
        </button>
        <div class="lightbox-content" @click.stop>
          <img :src="fullscreenImage" alt="Fullscreen preview" class="lightbox-main-img" />
        </div>
      </div>
    </Transition>
  </div>
</template>
 
<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { Check, CheckCheck, Loader, ArrowDown, CornerUpLeft, Pin, Trash2, Copy, X } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'
import type { Message } from '~/composables/useChat'
 
const props = withDefaults(defineProps<{
  messages: Message[]
  isTyping: boolean
  emojiOpen?: boolean
  replyingTo?: Message | null
}>(), {
  emojiOpen: false,
  replyingTo: null
})
 
const emit = defineEmits<{
  (e: 'scrollerAttached', element: HTMLElement): void
  (e: 'reply', message: Message): void
  (e: 'delete-message', id: string): void
  (e: 'notify', text: string): void
}>()
 
const { profile, activeChat } = useChat()

// Group messages dynamically by their date (Today, Yesterday, etc.)
const groupedMessageSegments = computed(() => {
  const segments: { date: string; messages: Message[] }[] = []
  props.messages.forEach(msg => {
    const d = msg.date || 'Today'
    let lastSegment = segments[segments.length - 1]
    if (!lastSegment || lastSegment.date !== d) {
      lastSegment = { date: d, messages: [] }
      segments.push(lastSegment)
    }
    lastSegment.messages.push(msg)
  })
  return segments
})

// Auto-assign beautiful colored names inside group bubbles, matching Telegram's high-fidelity theme
const getSenderColor = (name?: string) => {
  if (!name) return '#2481cc'
  const colors = [
    '#3498db', // Blue
    '#2ecc71', // Emerald Green
    '#e67e22', // Orange/Amber
    '#9b59b6', // Amethyst purple
    '#e74c3c', // Red/Crimson
    '#1abc9c', // Teal Turquoise
    '#f1c40f'  // Warm Gold
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
 
const isFirstOfGroup = (groupMessages: Message[], msg: Message, idx: number) => {
  if (idx === 0) return true
  return groupMessages[idx - 1].sender !== msg.sender
}

const isLastOfGroup = (groupMessages: Message[], msg: Message, idx: number) => {
  if (idx === groupMessages.length - 1) return true
  return groupMessages[idx + 1].sender !== msg.sender
}

const scrollArea = ref<HTMLElement | null>(null)
const showScrollFab = ref(false)

// Context Menu State
const contextMenu = ref<{
  visible: boolean
  x: number
  y: number
  message: Message | null
}>({
  visible: false,
  x: 0,
  y: 0,
  message: null
})

// Pinned Message state
const pinnedMessage = ref<Message | null>(null)

// Fullscreen Image Lightbox state
const fullscreenImage = ref<string | null>(null)
const openImageFullscreen = (url: string) => {
  fullscreenImage.value = url
}
const closeImageFullscreen = () => {
  fullscreenImage.value = null
}

const showToast = (text: string) => {
  emit('notify', text)
}

// Open context menu near click/tap coordinates
const openContextMenu = (event: MouseEvent, msg: Message) => {
  event.preventDefault()
  
  const wrapper = document.querySelector('.chat-viewport-wrapper')
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  
  // Align position relative to the chat viewport container
  let x = event.clientX - rect.left
  let y = event.clientY - rect.top
  
  // Boundary safety rules to ensure menu doesn't overflow
  const menuWidth = 150
  const menuHeight = 175
  if (x + menuWidth > rect.width) {
    x = rect.width - menuWidth - 12
  }
  if (x < 12) {
    x = 12
  }
  if (y + menuHeight > rect.height) {
    y = rect.height - menuHeight - 12
  }
  if (y < 12) {
    y = 12
  }

  contextMenu.value = {
    visible: true,
    x,
    y,
    message: msg
  }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.message = null
}

const handleReply = () => {
  if (contextMenu.value.message) {
    emit('reply', contextMenu.value.message)
  }
  closeContextMenu()
}

const handleCopy = () => {
  if (contextMenu.value.message) {
    const text = contextMenu.value.message.text
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard! 📋')
      }).catch(() => {
        showToast('Text copied! 📋')
      })
    } else {
      showToast('Copied! 📋')
    }
  }
  closeContextMenu()
}

const handlePin = () => {
  if (contextMenu.value.message) {
    pinnedMessage.value = contextMenu.value.message
    showToast('Activated Pinned Message! 📌')
  }
  closeContextMenu()
}

const handleDelete = () => {
  if (contextMenu.value.message) {
    emit('delete-message', contextMenu.value.message.id)
    showToast('Message deleted forever! 🗑️')
  }
  closeContextMenu()
}
 
// Handle Scroll event to toggle FAB
const handleScroll = () => {
  if (!scrollArea.value) return
  const s = scrollArea.value
  // Reveal FAB if User scrolled more than 150px away from bottom
  const distanceFromBottom = s.scrollHeight - s.clientHeight - s.scrollTop
  showScrollFab.value = distanceFromBottom > 150
}
 
// Scroll Area To Bottom
const scrollToBottom = async () => {
  showScrollFab.value = false
  await nextTick()
  if (scrollArea.value) {
    scrollArea.value.scrollTo({
      top: scrollArea.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Scroll to replied-to original message with a soft elegant row highlight
const scrollToMessage = (id: string) => {
  const targetElement = document.getElementById(`msg-${id}`)
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    targetElement.classList.add('reply-flash-active')
    setTimeout(() => {
      targetElement.classList.remove('reply-flash-active')
    }, 1200)
  }
}
 
// Watch emoji picker sheet toggle and scroll message log upward in sync
watch(() => props.emojiOpen, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      scrollToBottom()
    }, 150)
  }
})

// Automatically scroll to bottom if new messages arrive
watch(() => props.messages.length, () => {
  setTimeout(() => {
    scrollToBottom()
  }, 100)
})

onMounted(() => {
  if (scrollArea.value) {
    emit('scrollerAttached', scrollArea.value)
    // Small delay to initial scroll bottom so container renders fully first
    setTimeout(() => {
      scrollToBottom()
    }, 200)
  }
})
</script>

<style scoped>
.chat-viewport-wrapper {
  flex: 1;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-scroll-area {
  flex: 1;
  width: 100%;
  /* Comfortable 92px top padding matches header, bottom spacing is managed dynamically via .bottom-clear-spacer */
  padding: 92px 16px 0 16px; 
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1; /* Keep underlying elements in low stacking context so absolute FAB retreats under input actions */
  scroll-behavior: smooth;
  scroll-padding-bottom: 24px;
  display: flex;
  flex-direction: column;
}

/* Dynamic space Allocation for bottom controls to prevent layout clipping */
.bottom-clear-spacer {
  height: 112px; /* clears standard glass bar + extra padding */
  width: 100%;
  flex-shrink: 0;
  transition: height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-viewport-wrapper.has-reply-bar .bottom-clear-spacer {
  height: 152px; /* clears glass bar + reply preview block + extra padding */
}

.chat-viewport-wrapper.emoji-open .bottom-clear-spacer {
  height: 362px; /* clears elevated standard glass bar with emoji sheet + extra padding */
}

.chat-viewport-wrapper.emoji-open.has-reply-bar .bottom-clear-spacer {
  height: 402px; /* clears elevated glass bar + reply preview block + emoji sheet + extra padding */
}

/* Hide scrollbar fully across all engines */
.messages-scroll-area::-webkit-scrollbar {
  display: none !important;
}
.messages-scroll-area {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.bubbles-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  flex: 1;
  min-height: 100%;
}

.scroll-spacer {
  flex: 1;
  min-height: 0;
}

.bubbles-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px; /* tight Telegram-style group spacing */
}

/* Individual Alignments */
.bubble-item {
  display: flex;
  width: 100%;
  align-items: flex-end; /* perfectly aligns avatar and bubble at baseline */
}

/* Standard gap between different speakers */
.bubble-item.last-of-group {
  margin-bottom: 10px;
}

.bubble-item.them {
  justify-content: flex-start;
}

.bubble-item.me {
  justify-content: flex-end;
}

/* Base Bubble Style with Matte/Minimal design (No Glass Reflections, no steel look) */
.bubble-glass {
  max-width: 75%;
  padding: 10px 5px 6px 5px; /* Symmetrical 5px left/right padding as requested */
  position: relative;
  overflow: visible; /* Allows beautiful message tails to extend outside the box */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bubble-glass.has-image {
  overflow: hidden; /* Clips image and reply reference blocks neatly */
}

/* Hide reflection effects inside matte bubbles */
.bubble-glass .reflection-glow {
  display: none !important;
}

/* --- TELEGRAM GROUP CORNERS AND SHAPES --- */

/* Them Bubble (Incoming, left-aligned): Blue-gray slate */
.bubble-glass.them {
  background: #182533;
  border-style: var(--message-border-style, solid);
  border-width: var(--message-border-width, 1px);
  border-color: rgba(255, 255, 255, 0.05);
  color: #f5f5f7;
}

.bubble-glass.them:hover {
  background: #1c2b3b;
}

/* Default corners for them */
.bubble-item.them .bubble-glass {
  border-radius: var(--message-radius-val, 16px);
}
/* First of group (sequence of same sender): nicely rounded edges, slight flatten on joining edge */
.bubble-item.them.first-of-group:not(.last-of-group) .bubble-glass {
  border-radius: var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-small, 6px);
}
/* Middle of group: flat top and bottom left corners so they fuse into a single solid capsule block */
.bubble-item.them:not(.first-of-group):not(.last-of-group) .bubble-glass {
  border-radius: var(--message-radius-small, 6px) var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-small, 6px);
}
/* Last of group has the pointed baseline corner tail at the bottom left */
.bubble-item.them.last-of-group:not(.first-of-group) .bubble-glass {
  border-radius: var(--message-radius-small, 6px) var(--message-radius-val, 16px) var(--message-radius-val, 16px) 4px;
}
/* Single message (both first and last): pointed bottom left tail */
.bubble-item.them.first-of-group.last-of-group .bubble-glass {
  border-radius: var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-val, 16px) 4px;
}

/* Consecutive group message border merging so adjacent borders do not crowd */
.bubble-item.them:not(.first-of-group) .bubble-glass {
  border-top-color: transparent !important;
}
.bubble-item.them:not(.last-of-group) .bubble-glass {
  border-bottom-color: transparent !important;
}

/* Curve elements for solid dynamic tails */
.bubble-item.them.last-of-group .bubble-glass::before {
  content: "";
  position: absolute;
  bottom: 0px;
  left: -5px;
  width: 10px;
  height: 12px;
  background: #182533;
  border-bottom-left-radius: 10px 14px;
  z-index: -1;
  pointer-events: none;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  transition: background-color 0.2s ease;
}
.bubble-item.them.last-of-group .bubble-glass:hover::before {
  background: #1c2b3b;
}


/* Me Bubble (Outgoing, right-aligned): Premium Telegram solid blue */
.bubble-glass.me {
  background: #2b5278;
  border-style: var(--message-border-style, solid);
  border-width: var(--message-border-width, 1px);
  border-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.bubble-glass.me:hover {
  background: #2e5881;
}

/* Default corners for me */
.bubble-item.me .bubble-glass {
  border-radius: var(--message-radius-val, 16px);
}
/* First of group: bottom right joining edge gets a flat transition */
.bubble-item.me.first-of-group:not(.last-of-group) .bubble-glass {
  border-radius: var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-small, 6px) var(--message-radius-val, 16px);
}
/* Middle of group: flat top and bottom right to slide seamlessly between other cells */
.bubble-item.me:not(.first-of-group):not(.last-of-group) .bubble-glass {
  border-radius: var(--message-radius-val, 16px) var(--message-radius-small, 6px) var(--message-radius-small, 6px) var(--message-radius-val, 16px);
}
/* Last of group: tail on the bottom right corner */
.bubble-item.me.last-of-group:not(.first-of-group) .bubble-glass {
  border-radius: var(--message-radius-val, 16px) var(--message-radius-small, 6px) 4px var(--message-radius-val, 16px);
}
/* Single message: pointed bottom right tail */
.bubble-item.me.first-of-group.last-of-group .bubble-glass {
  border-radius: var(--message-radius-val, 16px) var(--message-radius-val, 16px) 4px var(--message-radius-val, 16px);
}

/* Consecutive group message border merging for outgoing bubbles */
.bubble-item.me:not(.first-of-group) .bubble-glass {
  border-top-color: transparent !important;
}
.bubble-item.me:not(.last-of-group) .bubble-glass {
  border-bottom-color: transparent !important;
}

/* Outgoing sender tail */
.bubble-item.me.last-of-group .bubble-glass::before {
  content: "";
  position: absolute;
  bottom: 0px;
  right: -5px;
  width: 10px;
  height: 12px;
  background: #2b5278;
  border-bottom-right-radius: 10px 14px;
  z-index: -1;
  pointer-events: none;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
  transition: background-color 0.2s ease;
}
.bubble-item.me.last-of-group .bubble-glass:hover::before {
  background: #2e5881;
}


/* --- TIMELINE DATE DIVIDERS --- */
.message-segment-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sticky-date-divider-wrapper {
  position: relative; /* Normal position relative matching user flow without floating/sticking */
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 14px 0 10px 0;
  pointer-events: none;
}

.sticky-date-divider-badge {
  background: rgba(15, 20, 31, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  color: #a4acb9;
  padding: 4px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-transform: capitalize;
  user-select: none;
  animation: badge-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes badge-fade-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

/* --- GROUP SENDER NAME COLORIZED TAG --- */
.bubble-sender-name {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-display);
}
.bubble-sender-name:hover {
  text-decoration: underline;
}


/* --- AVATAR CHIP LAYOUT --- */
.bubble-avatar-slot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  user-select: none;
}

.bubble-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.bubble-avatar-circle:hover {
  transform: scale(1.08) rotate(2deg);
}

.bubble-avatar-spacer {
  width: 32px;
  height: 32px;
}

/* Text formatting inside bubble */
.bubble-text {
  font-size: 14px;
  line-height: 1.45;
  word-wrap: break-word;
  white-space: pre-wrap;
  z-index: 2;
  position: relative;
  font-weight: 400;
  letter-spacing: -0.01em;
}

/* Meta time/check overlay */
.bubble-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.16);
  width: fit-content;
  margin-left: auto; /* pulls capsule cleanly to the right */
  font-size: 9.5px;
  opacity: 0.85;
  text-align: right;
  z-index: 2;
  position: relative;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.pinned-indicator-inline {
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  transform: rotate(35deg); /* aesthetic telegram-style pin slant */
  margin-left: 1px;
}

.bubble-time {
  font-family: var(--font-sans);
  color: rgba(255, 255, 255, 0.75);
}

.status-indicator {
  display: flex;
  align-items: center;
}

.check-icon {
  color: #ffffff;
  opacity: 0.95;
}

.check-icon.read {
  color: #ffffff;
  opacity: 0.95;
}

.check-icon.spin {
  animation: rotate 1s linear infinite;
}

/* Typing Bubble Custom Layout */
.typing-bubble {
  background: #182533;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px 16px 16px 4px;
  padding: 12px 18px;
  display: inline-flex;
  align-items: center;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  opacity: 0.4;
  animation: bouncetyping 1.4s infinite ease-in-out both;
}

.typing-indicator .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bouncetyping {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.1);
    opacity: 0.95;
  }
}

/* Scroll-to-bottom FAB (Symmetric alignment resting directly over the send button layer) */
.scroll-down-fab {
  position: absolute;
  right: 8px; /* Pixel-perfect right-padding match with action area buttons */
  bottom: 66px; 
  z-index: 5; /* Lower than bottom bar z-index (10) so it retires behind it gracefully */
  cursor: pointer;
  transition: bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease, background-color 0.25s ease, border-color 0.25s ease;
}

.chat-viewport-wrapper.emoji-open .scroll-down-fab {
  bottom: 316px; /* 66px base + 250px bottom sheet elevation */
}

.scroll-down-fab :deep(.icon-container) {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  animation: floatDown 2s infinite ease-in-out;
}

.scroll-down-fab:hover :deep(.icon-container) {
  color: var(--color-text-primary);
}

@keyframes floatDown {
  0%, 100% {
    transform: translateY(-1px);
  }
  50% {
    transform: translateY(1.5px);
  }
}

/* Animations for message list Transitions */
.bubble-enter-active {
  animation: bubble-bounce-in 0.35s cubic-bezier(0.19, 1, 0.22, 1) both;
}

.bubble-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.bubble-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

@keyframes bubble-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(18px);
    filter: blur(4px);
  }
  70% {
    transform: scale(1.02) translateY(-2px);
    filter: none;
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* FAB transitions matching the hint slide drawer physical effect */
.fab-slide-enter-active,
.fab-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25), opacity 0.3s ease;
}

.fab-slide-enter-from,
.fab-slide-leave-to {
  transform: translateY(22px) scale(0.96);
  opacity: 0;
}

/* General spin helper */
@keyframes rotate {
  100% { transform: rotate(360deg); }
}

/* Stacking or positioning actions dynamically alongside the card */
.bubble-item {
  position: relative;
  transition: background-color 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
}

/* Telegram elegant row-only feedback highlight */
.bubble-item.reply-flash-active {
  animation: telegram-row-flash 1.2s cubic-bezier(0.215, 0.610, 0.355, 1) both;
}

.bubble-item.menu-active {
  background-color: rgba(255, 255, 255, 0.05);
}

@keyframes telegram-row-flash {
  0% {
    background-color: rgba(255, 255, 255, 0.16);
  }
  40% {
    background-color: rgba(255, 255, 255, 0.12);
  }
  100% {
    background-color: transparent;
  }
}

/* Telegram Style Reply Header Reference inside the bubble - tighter & clean packaging */
.reply-ref-card {
  margin-bottom: 5px;
  background: rgba(255, 255, 255, 0.04);
  border-left: 3px solid #2ea6ff;
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  cursor: pointer;
  user-select: none;
  font-size: 11px;
  overflow: hidden;
  max-width: 100%;
  transition: background-color 0.15s ease;
}

.reply-ref-card.me {
  border-left-color: #4da6ff;
}

.reply-ref-card.them {
  border-left-color: #ff4d6d;
}

.reply-ref-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.reply-ref-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.reply-ref-sender {
  font-weight: 600;
  font-size: 11px;
  color: #2ea6ff;
  line-height: 1.2;
}

.reply-ref-card.them .reply-ref-sender {
  color: #ff4d6d;
}

.reply-ref-card.me .reply-ref-sender {
  color: #4da6ff;
}

.reply-ref-text {
  font-size: 10.5px;
  opacity: 0.75;
  color: #f5f5f7;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* Telegram Ultimate Glass Context Menu */
.telegram-context-menu {
  position: absolute;
  z-index: 120;
  min-width: 140px;
  background: rgba(22, 28, 45, 0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 2px;
  transform-origin: top left;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 7px 11px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.menu-item.text-danger {
  color: #ff4d6d;
}

.menu-item.text-danger:hover {
  background: rgba(255, 77, 109, 0.12);
}

.menu-icon {
  opacity: 0.85;
  color: #ffffff;
}

.menu-icon.text-danger-icon {
  color: #ff4d6d;
  opacity: 1;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px;
}

/* Safe clicking barrier overlay */
.context-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: transparent;
  cursor: default;
}

/* Dynamic Telegram Pinned Message Bar */
.pinned-message-bar {
  position: absolute;
  top: 62px; /* Nestles tight and snug + 2px gap beneath the glassy profile header */
  left: 8px;
  right: 8px;
  height: 44px;
  background: rgba(18, 25, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px; /* Beautifully matches the rounded pill edges of the header */
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  z-index: 90;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.pinned-message-bar:hover {
  background: rgba(25, 34, 56, 0.85);
  border-color: rgba(255, 255, 255, 0.15);
}

.pin-icon-box {
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pin-icon-pulse {
  animation: scale-pulsate 2s infinite ease-in-out;
}

@keyframes scale-pulsate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); opacity: 0.9; }
}

.pinned-text-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pinned-header {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.02em;
}

.pinned-preview-line {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unpin-action-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.unpin-action-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* Glass Pinned Indicators inside bubble metas */
.pinned-indicator-inline {
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
}

/* Push message viewport down when pinned message bar is visible */
.chat-viewport-wrapper.has-pinned-bar .messages-scroll-area {
  padding-top: 114px; /* Perfectly aligns content flow spacing with the closer +2px pin card */
}

/* Context menu transitions */
.menu-zoom-enter-active,
.menu-zoom-leave-active {
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
}

.menu-zoom-enter-from,
.menu-zoom-leave-to {
  transform: scale(0.85);
  opacity: 0;
}

/* Slide animations for top pinned bar drawer */
.pin-bar-slide-enter-active,
.pin-bar-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.pin-bar-slide-enter-from,
.pin-bar-slide-leave-to {
  transform: translateY(-16px);
  opacity: 0;
}

/* Styling for bubble when it has an image attachment */
.bubble-glass.has-image {
  padding: 0 !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bubble-glass.has-image .bubble-sender-name {
  padding: 8px 12px 2px 12px;
  margin-bottom: 0;
}

.bubble-glass.has-image .reply-ref-card {
  margin: 8px 12px 4px 12px;
}

.bubble-image-container {
  width: 100%;
  max-width: 320px;
  max-height: 240px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border-radius: 0 !important; /* No rounded borders on the image */
  display: block;
  margin-top: 0;
  margin-bottom: 0;
}

.bubble-glass.image-only {
  position: relative;
}

.bubble-glass.image-only .bubble-image-container {
  border-radius: 0 !important;
}

.bubble-attached-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: block;
  border-radius: 0 !important; /* Flat borders as requested */
}

.bubble-image-container:hover .bubble-attached-image {
  transform: scale(1.03);
}

/* Caption and meta container styling when image is present */
.bubble-glass.has-image .bubble-text {
  padding: 8px 12px 6px 12px;
}

.bubble-glass.has-image .bubble-meta {
  margin: 0 12px 8px auto;
  padding: 2px 6px;
}

/* Float absolute capsule overlay in bottom-right corner for image-only messages */
.bubble-glass.image-only .bubble-meta {
  position: absolute;
  bottom: 8px;
  right: 8px;
  margin: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2px 6px;
  z-index: 5;
}

/* Image Fullscreen Lightbox Overlay Style */
.image-lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(8, 12, 21, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  pointer-events: auto;
}

.lightbox-content {
  max-width: 85vw;
  max-height: 80vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  animation: lightboxZoom 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.lightbox-main-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
}

.lightbox-close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  color: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1010;
}

.lightbox-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

@keyframes lightboxZoom {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Premium image thumbnail inside top pinned message bar */
.pinned-mini-thumb {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  flex-shrink: 0;
}

.pinned-mini-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
