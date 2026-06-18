<template>
  <div class="app-viewport">
    <!-- Atmospheric Moving Liquid Background -->
    <div class="liquid-bg"></div>
    
    <!-- Core Vibes Glass Chat Shell -->
    <main class="chat-shell" id="chat-desktop-frame">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <!-- Unified Interactive Glass Alert Toast (Used universally across the app) -->
      <Transition name="toast-slide">
        <div v-if="toastMessage" class="unified-glass-toast" :class="{ 'emoji-open': emojiOpen && activeChatId, 'on-top': !activeChatId }">
          <Info :size="14" class="toast-indicator-icon" />
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>
    </main>
    
    <!-- Info Tag for desktop viewports to showcase responsive layout -->
    <div class="interactive-tag-overlay" id="interactive-credits">
      <span class="status-indicator-light"></span>
      <span class="tag-label">Vibes • Telegram-Inspired Glass UI Engine</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'

const { toastMessage, emojiOpen, activeChatId } = useChat()
</script>

<style scoped>
.app-viewport {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--color-bg-dark);
}

/* Central Responsive Chat Shell */
.chat-shell {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  overflow: hidden;
  transition: max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Floating Desktop Layout Frame (Responsive Expansion on Desktop) */
@media (min-width: 768px) {
  .chat-shell {
    width: 440px;
    height: 85vh;
    max-height: 800px;
    border-radius: 28px;
    border: none;
    box-shadow: none;
    background: transparent;
  }
}

/* Small Info Tag under Desktop Frame */
.interactive-tag-overlay {
  display: none;
  position: fixed;
  bottom: 24px;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  background: rgba(15, 20, 35, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 50;
  user-select: none;
  animation: fadeIn 1s ease-out;
}

@media (min-width: 768px) {
  .interactive-tag-overlay {
    display: inline-flex;
  }
}

.status-indicator-light {
  width: 6px;
  height: 6px;
  background-color: var(--color-active);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-active);
}

.tag-label {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Unified High-Fidelity Glass Toast */
.unified-glass-toast {
  position: absolute;
  bottom: 76px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(13, 17, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  z-index: 155;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              top 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  width: max-content;
  max-width: 90%;
}

.unified-glass-toast.emoji-open {
  transform: translate(-50%, -250px);
}

.unified-glass-toast.on-top {
  bottom: auto;
  top: 76px;
}

.toast-indicator-icon {
  color: var(--color-accent-blue);
  flex-shrink: 0;
}

/* Slide Transition for Toast */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, 22px) scale(0.95);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 22px) scale(0.95);
}

.toast-slide-enter-from.emoji-open {
  opacity: 0;
  transform: translate(-50%, -228px) scale(0.95);
}
.toast-slide-leave-to.emoji-open {
  opacity: 0;
  transform: translate(-50%, -228px) scale(0.95);
}

/* On-top specific transitions */
.toast-slide-enter-from.on-top {
  opacity: 0;
  transform: translate(-50%, -22px) scale(0.95);
}
.toast-slide-leave-to.on-top {
  opacity: 0;
  transform: translate(-50%, -22px) scale(0.95);
}
</style>
