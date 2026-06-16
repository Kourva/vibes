<template>
  <div class="bottom-area-container" :class="{ 'emoji-open': showEmojiSheet }" id="bottom-systems-root">
    <!-- Sliding Emoji Bottom Sheet (Functional Drawer) -->
    <Transition name="sheet-slide">
      <div v-if="showEmojiSheet" class="emoji-bottom-sheet" id="emoji-sheet-panel">
        <div class="sheet-content">
          <div class="sheet-header">
            <span class="sheet-title">Emojis</span>
            <div class="category-list">
              <button 
                v-for="cat in emojiCategories" 
                :key="cat.id" 
                class="category-tab"
                :class="{ active: activeCategory === cat.id }"
                @click="activeCategory = cat.id"
                :title="cat.label"
              >
                {{ cat.symbol }}
              </button>
            </div>
          </div>
          <div class="emoji-grid-viewport">
            <button 
              v-for="emoji in currentEmojis" 
              :key="emoji" 
              class="emoji-cell"
              @click="appendEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="three-part-bottom" id="chat-bottom-bar">
      <!-- Left: Single Emoji Action Circle (46px x 46px) -->
      <button 
        class="bottom-circle emoji-btn glass-panel-unified glass-circle-unified ripple-on-click" 
        :class="{ active: showEmojiSheet }"
        @click="toggleEmojiSheet" 
        aria-label="Add Emoji"
        id="btn-emoji"
      >
        <span class="icon-container flex-container">
          <Smile :size="19" />
        </span>
      </button>

      <!-- Center: Main Input Field Capsule with Paperclip Inside (Flexible height) -->
      <div class="input-container" id="bottom-actions-center">
        <!-- Reply preview header block inside the input area -->
        <Transition name="reply-fade">
          <div v-if="replyingTo" class="input-reply-bar">
            <div class="reply-bar-icon">
              <CornerUpLeft :size="14" />
            </div>
            <div class="reply-bar-details">
              <div class="reply-bar-sender" :class="replyingTo.sender">
                {{ replyingTo.sender === 'me' ? 'You' : replyingTo.senderName || 'Seraphina' }}
              </div>
              <div class="reply-bar-text">{{ replyingTo.text }}</div>
            </div>
            <button 
              type="button" 
              class="reply-close-btn flex-container" 
              @click="$emit('cancel-reply')"
              aria-label="Cancel reply"
            >
              <X :size="14" />
            </button>
          </div>
        </Transition>

        <div class="input-row-actions">
          <textarea 
            v-model="inputText" 
            placeholder="Write a message..." 
            class="message-input"
            @keydown="handleKeyDown"
            ref="textareaRef"
            rows="1"
            id="chat-message-input"
          ></textarea>
          
          <!-- File attachment at the end of the message input field -->
          <button 
            type="button" 
            class="input-file-btn ripple-on-click"
            :class="{ active: showAttachMock }"
            @click="toggleAttachMock" 
            aria-label="Attach File"
            id="btn-attach"
          >
            <Paperclip :size="18" />
          </button>
        </div>
      </div>

      <!-- Right: Send / Voice Circle (46px x 46px) -->
      <button 
        class="bottom-circle action-btn glass-panel-unified glass-circle-unified ripple-on-click" 
        :class="{ 'send-active': hasText }"
        @click="handleActionClick" 
        :aria-label="hasText ? 'Send Message' : 'Record Voice'"
        id="btn-right-action"
      >
        <span class="icon-container flex-container">
          <Transition name="icon-fade" mode="out-in">
            <Send v-if="hasText" class="action-icon" :size="19" key="send-icon" />
            <Mic v-else class="action-icon" :size="19" key="mic-icon" />
          </Transition>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Smile, Paperclip, Send, Mic, CornerUpLeft, X } from 'lucide-vue-next'
import type { Message } from '~/composables/useChat'

const props = defineProps<{
  replyingTo?: Message | null
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'emoji-toggle', visible: boolean): void
  (e: 'cancel-reply'): void
  (e: 'notify', text: string): void
}>()

const inputText = ref('')
const hasText = computed(() => inputText.value.trim().length > 0)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const showEmojiSheet = ref(false)
const showAttachMock = ref(false)

// Focus input whenever reply is activated to mimic high-fidelity chat experience
watch(() => props.replyingTo, (newMsg) => {
  if (newMsg) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
})

const triggerAlert = (text: string) => {
  emit('notify', text)
}

// Emoji picker categories and dataset
const emojiCategories = [
  { id: 'recent', symbol: '🕒', label: 'Recently Used' },
  { id: 'smiley', symbol: '😊', label: 'Smileys & Emotion' },
  { id: 'nature', symbol: '🐱', label: 'Animals & Nature' },
  { id: 'food', symbol: '🍔', label: 'Food & Drink' },
  { id: 'travel', symbol: '🚀', label: 'Travel & Places' },
  { id: 'object', symbol: '💡', label: 'Objects & Symbols' }
]

const recentEmojis = ref<string[]>(['😂', '❤️', '😍', '👍', '🔥', '🎉', '✨', '👏'])

const emojiGroups: Record<string, string[]> = {
  recent: recentEmojis.value,
  smiley: ['😂', '🤣', '❤️', '😍', '😊', '🥰', '😘', '😉', '😜', '😎', '🤩', '🤔', '🤨', '😐', '😢', '😭', '😡', '😱', '😴', '👍', '👎', '🔥', '🎉', '✨', '👏'],
  nature: ['🐱', '🐶', '🦊', '🦁', '🐯', '🐼', '🐨', '🦄', '🐰', '🐸', '🐵', '🐔', '🐧', '🦆', '🐝', '🐛', '🌸', '🌹', '🍀', '🌲'],
  food: ['🍎', '🍓', '🍕', '🍔', '🍟', '🍣', '🌮', '🍦', '🍩', '🍺', '🥂', '☕', '🍉', '🍇', '🍒', '🍿', '🍪', '🍫', '🥤', '🍷'],
  travel: ['⚽', '🏀', '🎾', '🎮', '🚗', '✈️', '🚀', '🚢', '🏖️', '🏔️', '⛺', '🛸', '🎵', '🎸', '🎨', '📚', '🗺️', '🗽', '🗼', '🎪'],
  object: ['💻', '📱', '⌚', '💡', '🔑', '🎁', '🎈', '🧸', '💥', '💯', '🌟', '🌈', '⚡', '🍀', '🧿', '🔮', '✉️', '📎', '🔒', '🔔']
}

const activeCategory = ref('smiley')
const currentEmojis = computed(() => {
  if (activeCategory.value === 'recent') {
    return recentEmojis.value
  }
  return emojiGroups[activeCategory.value] || []
})

const appendEmoji = (emoji: string) => {
  inputText.value += emoji
  
  // Track recently used emojis
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value.unshift(emoji)
    if (recentEmojis.value.length > 16) {
      recentEmojis.value.pop()
    }
  } else {
    recentEmojis.value = [emoji, ...recentEmojis.value.filter(e => e !== emoji)]
  }
}

const toggleEmojiSheet = () => {
  showEmojiSheet.value = !showEmojiSheet.value
  showAttachMock.value = false
  emit('emoji-toggle', showEmojiSheet.value)
}

const toggleAttachMock = () => {
  showAttachMock.value = !showAttachMock.value
  if (showEmojiSheet.value) {
    showEmojiSheet.value = false
    emit('emoji-toggle', false)
  }
  if (showAttachMock.value) {
    triggerAlert('File attachment selector requested (Design Interface Mock)')
  }
}

const adjustHeight = () => {
  const ta = textareaRef.value
  if (!ta) return
  ta.style.height = '24px' // baseline min-height
  const newHeight = Math.min(ta.scrollHeight, 120)
  ta.style.height = `${newHeight}px`
}

watch(inputText, async () => {
  await nextTick()
  adjustHeight()
})

const handleSend = () => {
  const text = inputText.value.trim()
  if (text) {
    emit('send', text)
    inputText.value = ''
    if (showEmojiSheet.value) {
      showEmojiSheet.value = false
      emit('emoji-toggle', false)
    }
    showAttachMock.value = false
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = '24px'
      }
    })
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleActionClick = () => {
  if (hasText.value) {
    handleSend()
  } else {
    triggerAlert('Hold to record voice (Design Interface Mock)')
  }
}
</script>

<style scoped>
/* Bottom container holding everything */
.bottom-area-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none; /* Let clicks pass to bubbles behind in margins */
}

/* Enable pointer events on concrete interactive child components */
.emoji-bottom-sheet,
.three-part-bottom,
.glass-alert-toast {
  pointer-events: auto;
}

.three-part-bottom {
  display: flex;
  align-items: flex-end; /* Align all actions nicely to bottom on layout expansion */
  justify-content: space-between;
  gap: var(--glass-gap, 8px);
  width: 100%;
  padding: 12px var(--glass-gap, 8px);
  position: relative;
  z-index: 11; /* Elevate input action circles over emoji keyboard */
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.bottom-area-container.emoji-open .three-part-bottom {
  transform: translateY(-250px);
}

/* Base button circles */
.bottom-circle {
  border: 1px solid var(--glass-border);
  cursor: pointer;
  background: var(--glass-bg);
  position: relative;
  z-index: 3;
}

.bottom-circle.active {
  background: rgba(0, 136, 204, 0.18);
  border-color: rgba(0, 136, 204, 0.45);
}

.bottom-circle.active :deep(svg) {
  color: var(--color-accent-blue);
}

/* Input capsule container with flexible growing height */
.input-container {
  flex: 1;
  min-height: var(--glass-unit-size, 46px);
  height: auto;
  border-radius: 23px; /* Full curved capsule look match with 46px unit size */
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  transition: border-color 0.25s ease, background-color 0.25s ease;
  position: relative;
  z-index: 3;
}

.input-container:focus-within {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(13, 16, 28, 0.78);
}

.message-input {
  flex: 1;
  min-height: 20px;
  max-height: 120px;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  font-size: 14px;
  caret-color: var(--color-accent-blue);
  resize: none;
  line-height: 1.4;
  padding: 4px 2px;
  margin: 0;
  display: block;
}

.message-input::placeholder {
  color: var(--color-text-muted);
}

/* File button inside text area */
.input-file-btn {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.input-file-btn:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.input-file-btn.active {
  color: var(--color-accent-blue);
  background: rgba(0, 136, 204, 0.15);
}

.flex-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn {
  background: var(--glass-bg);
}

.action-btn.send-active {
  background: rgba(0, 136, 204, 0.22);
  border-color: rgba(0, 136, 204, 0.45);
}

.action-btn.send-active:hover {
  background: var(--color-accent-blue);
  border-color: var(--color-accent-blue);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* Symmetric icon adjustment inside send container */
.action-icon {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.action-btn:hover .action-icon {
  color: var(--color-text-primary);
}

/* Icon transition effects */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Floating interactive prompt toast above bottom actions, starting from under the bottom actions bar */
/* Elegant glass bottom sheet style for the emoji picker */
.emoji-bottom-sheet {
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  height: 250px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-top: 1px solid var(--glass-border);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  z-index: 6; /* behind the relative input controls which are z-index: 11 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-content {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sheet-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  user-select: none;
}

.category-list {
  display: flex;
  gap: 3px;
}

.category-tab {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 14px;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-tab.active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.emoji-grid-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
}

/* Hide scrollbar fully across all engines in emoji grids */
.emoji-grid-viewport::-webkit-scrollbar {
  display: none !important;
}
.emoji-grid-viewport {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.emoji-cell {
  background: transparent;
  border: none;
  font-size: 19px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: 8px;
  transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.25), background-color 0.15s;
}

.emoji-cell:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.15);
}

.emoji-cell:active {
  transform: scale(0.9);
}

/* Sheet slide Transition animations */
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
  opacity: 0.8;
}

/* Telegram Style Reply Bar layout and styling in the footer */
.input-row-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
}

.input-reply-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
  margin-bottom: var(--reply-margin, 4px);
  width: 100%;
  position: relative;
}

.reply-bar-icon {
  color: var(--color-accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.85;
}

.reply-bar-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.reply-bar-sender {
  font-weight: 600;
  font-size: 11px;
  color: #2ea6ff;
  margin-bottom: 1px;
}

.reply-bar-sender.them {
  color: #ff4d6d;
}

.reply-bar-sender.me {
  color: #4da6ff;
}

.reply-bar-text {
  font-size: 12px;
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}

.reply-close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.45);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background-color 0.15s;
}

.reply-close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

/* Reply fading transition styles */
.reply-fade-enter-active,
.reply-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.reply-fade-enter-from,
.reply-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  margin-bottom: -28px;
}
</style>

