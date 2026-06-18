<template>
  <header class="three-part-header" :class="{ 'no-left-action': !active, 'search-mode': showSearch && !active, 'chat-search-active': active && isSearchOpen }" id="chat-header">
    <!-- Left: Back Button Circle (46px x 46px) -->
    <button 
      v-if="active"
      class="header-circle glass-panel-unified glass-circle-unified ripple-on-click" 
      aria-label="Go Back" 
      id="btn-back"
      @click="$emit('back')"
    >
      <span class="icon-container">
        <ArrowLeft :size="19" />
      </span>
    </button>

    <!-- Center: Profile Details Capsule (46px Height, fully symmetric) or "Chats" Title Capsule -->
    <div class="header-capsule glass-panel-unified glass-capsule-unified" id="header-profile-panel">
      <!-- Active Chat Details -->
      <div v-if="active" class="profile-content">
        <!-- Avatar with Glowing Status Ring -->
        <div class="avatar-container">
          <div class="avatar" :style="{ background: profile?.avatarColor }">
            {{ profile?.avatar?.charAt(0) }}
          </div>
          <span 
            class="status-dot" 
            :class="{ typing: profile?.status?.includes('typing...') }"
          ></span>
        </div>
        
        <!-- User Details -->
        <div class="details">
          <h1 class="user-name">{{ profile?.name }}</h1>
          <span class="user-status" :class="{ typing: profile?.status?.includes('typing...') }">
            {{ profile?.status }}
          </span>
        </div>
      </div>

      <!-- Chats List Header Details (Shrinks when search is active) -->
      <div v-else class="chats-title-content">
        <div class="details">
          <h1 class="user-name">Chats</h1>
          <span class="user-status">{{ conversationCount || 0 }} conversations</span>
        </div>
      </div>
    </div>

    <!-- Right: Grouped Actions (Search & 3-dot menu) or Active Inline Expanded Search Input -->
    <div 
      class="header-actions-right glass-panel-unified glass-capsule-unified" 
      :class="{ 'search-expanded': isSearchOpen }"
      id="header-actions-right"
    >
      <div v-if="isSearchOpen" class="header-search-box">
        <Search :size="19" class="search-box-icon" />
        <input 
          v-model="currentSearchQuery" 
          type="text" 
          placeholder="Search..." 
          class="header-search-input"
          @keydown.esc="isSearchOpen = false; currentSearchQuery = ''"
          ref="searchInputRef"
        />
        <button @click="isSearchOpen = false; currentSearchQuery = ''" class="search-close-btn" aria-label="Close search">
          <X :size="19" />
        </button>
      </div>
      <template v-else>
        <button class="action-btn-item ripple" aria-label="Search Messages" id="btn-search" @click="isSearchOpen = true">
          <Search :size="19" />
        </button>
        <button class="action-btn-item ripple" aria-label="More Options" id="btn-more" @click="$emit('more')">
          <MoreVertical :size="19" />
        </button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { ArrowLeft, Search, MoreVertical, X } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'
import type { UserProfile } from '~/composables/useChat'
import { gsap } from 'gsap'

const props = defineProps<{
  profile?: UserProfile
  active: boolean
  conversationCount?: number
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'menu'): void
  (e: 'more'): void
  (e: 'search', query: string): void
}>()

const { showSearch: globalShowSearch, searchQuery: globalSearchQuery } = useChat()

// Separate independent local search state for the active chat page header
const localShowSearch = ref(false)
const localSearchQuery = ref('')

const isSearchOpen = computed({
  get() {
    return props.active ? localShowSearch.value : globalShowSearch.value
  },
  set(val) {
    if (props.active) {
      localShowSearch.value = val
    } else {
      globalShowSearch.value = val
    }
  }
})

const currentSearchQuery = computed({
  get() {
    return props.active ? localSearchQuery.value : globalSearchQuery.value
  },
  set(val) {
    if (props.active) {
      localSearchQuery.value = val
      emit('search', val)
    } else {
      globalSearchQuery.value = val
    }
  }
})

const searchInputRef = ref<HTMLInputElement | null>(null)

watch(isSearchOpen, async (val) => {
  if (val) {
    await nextTick()
    searchInputRef.value?.focus()
  }
})
</script>

<style scoped>
.three-part-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--glass-gap, 8px);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 10px var(--glass-gap, 8px);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Symmetric capsule alignment and reduced padding */
.header-capsule {
  flex: 1;
  justify-content: flex-start;
  padding: 0 12px 0 4px; /* Reduced left padding to visually snap avatar to left edge */
  cursor: default !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 0;
}

.header-capsule:hover {
  background: var(--glass-bg) !important;
  border-color: var(--glass-border) !important;
  box-shadow: var(--glass-shadow) !important;
}

/* Search Mode: Shrink center capsule in width */
.three-part-header.search-mode .header-capsule {
  flex: 0 1 120px;
  opacity: 0.6;
}

/* Chat Search Active: Collapse the profile details completely to show ONLY the avatar with perfect symmetric center padding */
.three-part-header.chat-search-active .header-capsule {
  flex: 0 0 46px !important;
  width: 46px !important;
  height: 46px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  overflow: hidden;
}

.three-part-header.chat-search-active .status-dot {
  display: none !important;
}

.three-part-header.chat-search-active .header-capsule .details {
  display: none !important;
}

.three-part-header.chat-search-active .profile-content {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
}

.three-part-header.chat-search-active .avatar-container {
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
}

/* Stacked stories block in header capsule */
.header-stories-stack {
  display: flex;
  align-items: center;
  width: 70px;
  height: 38px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 2px;
}

.header-story-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  position: absolute;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.story-ring-gradient {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-story-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1.2px solid rgba(13, 17, 30, 0.95);
}

/* Move the details (Chats title) rightward when stories are showing */
.details.has-stories-offset {
  margin-left: 8px;
  transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  z-index: 3;
}

.chats-title-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: 12px;
  z-index: 3;
  overflow: hidden;
}

.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.status-dot {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 9px;
  height: 9px;
  background-color: var(--color-active);
  border: 1.5px solid rgba(11, 14, 26, 0.93);
  border-radius: 50%;
}

.status-dot.typing {
  animation: pulseGreen 1.2s infinite ease-in-out;
}

.details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  min-width: 0;
}

.user-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.1;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status.typing {
  color: var(--color-active);
  font-weight: 500;
}

/* Grouped Actions Right Capsule styling */
.header-actions-right {
  width: 82px;
  flex: none !important;
  justify-content: space-evenly;
  gap: 0px;
  padding: 0 4px;
  cursor: default !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.header-actions-right:hover {
  background: var(--glass-bg) !important;
  border-color: var(--glass-border) !important;
  box-shadow: var(--glass-shadow) !important;
}

/* Search expanded styling */
.header-actions-right.search-expanded {
  flex: 1 1 auto !important;
  width: auto;
  max-width: none;
  padding: 0 12px;
  justify-content: flex-start;
}

/* Inside search box layout */
.header-search-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 6px;
}

.search-box-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.header-search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 13px;
  color: var(--color-text-primary);
  outline: none;
  caret-color: var(--color-accent-blue);
  width: 100%;
}

.header-search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.search-close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.action-btn-item {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.action-btn-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
}

.action-btn-item :deep(svg) {
  display: block;
}

@keyframes pulseGreen {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
    box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.5);
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 0 0 4px rgba(52, 199, 89, 0);
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
    box-shadow: 0 0 0 0 rgba(52, 199, 89, 0);
  }
}
</style>
