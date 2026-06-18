<template>
  <div class="page-container" id="list-page">
    
    <!-- Active Tab Screens -->
    <div class="tab-scroller-content">
      
      <!-- 1. Chats Viewport (Active main view) -->
      <ChatList 
        v-if="activeTab === 'chats'"
        :chats="chats"
        @select="onChatSelect"
      />

      <!-- 2. Profile Viewport -->
      <div v-else-if="activeTab === 'profile'" class="sub-viewport-container profile-page-view animate-fade-in">
        <div class="profile-view-scroll">
          <div class="profile-header-card">
            <div class="large-profile-avatar-container">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" alt="Vibes Developer" class="large-profile-avatar-img" />
              <span class="profile-online-badge">online</span>
            </div>
            <h2 class="profile-display-name">Vibes Developer</h2>
            <p class="profile-sub-online">@kowshankabir</p>
          </div>

          <div class="profile-info-cards">
            <!-- Card Item 1: Phone -->
            <div class="info-card-item glass-card-unified">
              <div class="card-icon-box">
                <Phone :size="18" class="card-icon" />
              </div>
              <div class="card-details">
                <span class="card-value">+1 (555) 723-1495</span>
                <span class="card-label">Mobile</span>
              </div>
            </div>

            <!-- Card Item 2: Username & Bio -->
            <div class="info-card-item glass-card-unified">
              <div class="card-icon-box">
                <Info :size="18" class="card-icon" />
              </div>
              <div class="card-details">
                <span class="card-value">@kowshankabir</span>
                <span class="card-label">Username</span>
                
                <p class="card-bio-text">
                  Vibes is where the flow meets high fidelity UI design. Built on Nuxt 4, crafted with GSAP and frosted liquid glass. 🌊✨
                </p>
                <span class="card-label">Bio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 3. Settings Viewport -->
      <div v-else-if="activeTab === 'settings'" class="sub-viewport-container settings-page-view animate-fade-in">
        <div class="settings-view-scroll">
          <h2 class="section-master-title">App Settings</h2>

          <!-- Theme selector box -->
          <div class="settings-section glass-card-unified">
            <div class="section-header">Appearance Theme</div>
            <div class="theme-picker-row">
              <button 
                class="theme-button" 
                :class="{ active: selectedTheme === 'light' }"
                @click="selectedTheme = 'light'"
                type="button"
              >
                <span class="theme-color-preview light"></span>
                <span class="theme-name">Light</span>
              </button>
              
              <button 
                class="theme-button" 
                :class="{ active: selectedTheme === 'dark' }"
                @click="selectedTheme = 'dark'"
                type="button"
              >
                <span class="theme-color-preview dark"></span>
                <span class="theme-name">Dark</span>
              </button>
              
              <button 
                class="theme-button" 
                :class="{ active: selectedTheme === 'oled' }"
                @click="selectedTheme = 'oled'"
                type="button"
              >
                <span class="theme-color-preview oled"></span>
                <span class="theme-name">OLED</span>
              </button>
            </div>
          </div>

          <!-- COOL COLOR ACCENT VARIANTS -->
          <div class="settings-section glass-card-unified">
            <div class="section-header">Color Accent Variant</div>
            <div class="accent-picker-row">
              <button 
                v-for="acc in [
                  { id: 'blue', name: 'Blue', color: '#2481cc' },
                  { id: 'emerald', name: 'Emerald', color: '#34c759' },
                  { id: 'purple', name: 'Purple', color: '#da22ff' },
                  { id: 'amber', name: 'Amber', color: '#f5af19' },
                  { id: 'crimson', name: 'Rose', color: '#ff416c' }
                ]"
                :key="acc.id"
                class="accent-color-btn"
                :class="{ active: selectedAccent === acc.id }"
                @click="selectedAccent = acc.id; triggerToast('Accent variant synced! ✨')"
                type="button"
              >
                <span class="accent-color-dot" :style="{ backgroundColor: acc.color }"></span>
                <span class="accent-color-name">{{ acc.name }}</span>
              </button>
            </div>
          </div>

          <!-- CHAT STYLE & CUSTOMIZER WITH LIVE PREVIEW -->
          <div class="settings-section glass-card-unified">
            <div class="section-header">Chat Style & Customizer</div>
            
            <div class="customizer-sub-block">
              <span class="customizer-sub-title">Message Border style</span>
              <div class="customizer-grid-selector">
                <button 
                  v-for="b in ['none', 'solid', 'dashed', 'dotted', 'double']" 
                  :key="b"
                  class="prefab-option-btn" 
                  :class="{ active: messageBorder === b }"
                  @click="messageBorder = b"
                  type="button"
                >
                  {{ b.toUpperCase() }}
                </button>
              </div>
            </div>

            <div class="customizer-sub-block">
              <span class="customizer-sub-title">Message Bubble Corners</span>
              <div class="customizer-grid-selector">
                <button 
                  v-for="r in ['dense', 'standard', 'extra']" 
                  :key="r"
                  class="prefab-option-btn" 
                  :class="{ active: messageRadius === r }"
                  @click="messageRadius = r"
                  type="button"
                >
                  {{ r.toUpperCase() }}
                </button>
              </div>
            </div>

            <!-- LIVE PREVIEW BLOCK -->
            <div class="chat-customizer-preview-card">
              <div class="preview-card-header">Interactive Live Preview</div>
              <div class="preview-bubbles-container">
                <div class="preview-bubble them">
                  <div class="preview-bubble-text">Hey there! Tap options above to style my bubble corners and borders in real-time! 🌈</div>
                  <div class="preview-bubble-time">10:42 AM</div>
                </div>
                <div class="preview-bubble me">
                  <div class="preview-bubble-text">This is incredible! The style updates are perfectly synchronized! 🐋🔥</div>
                  <div class="preview-bubble-time">10:43 AM</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Attributes toggle settings list -->
          <div class="settings-section glass-card-unified">
            <div class="section-header">System Attributes</div>
            
            <div class="setting-row-item">
              <span class="setting-row-title">Auto-scroll on messages</span>
              <div class="toggle-mock active"></div>
            </div>
            
            <div class="setting-row-item">
              <span class="setting-row-title">Ambient Fluid Background</span>
              <div class="toggle-mock active"></div>
            </div>
            
            <div class="setting-row-item" @click="triggerToast('Sound effects setting initialized! 🔊')">
              <span class="setting-row-title">Premium Keyboard Sound FX</span>
              <div class="toggle-mock"></div>
            </div>
          </div>

          <!-- App credits item -->
          <div class="settings-footer-info">
            <p>Vibes for Web v4.2.0 (Stable)</p>
            <p>Telegram-Style Frameless Liquid Display</p>
          </div>
        </div>
      </div>

      <!-- 4. New Chat Viewport -->
      <div v-else-if="activeTab === 'new-chat'" class="sub-viewport-container new-chat-page-view animate-fade-in">
        <div class="new-chat-view-scroll">
          <h2 class="section-master-title">New Conversation</h2>

          <!-- New Group Block (Disabled Mock) -->
          <div class="settings-section glass-card-unified disabled-mock-section" @click="triggerToast('Group chats are read-only in preview!')">
            <div class="mock-header">
              <div class="mock-icon-capsule">
                <Users :size="18" class="mock-icon" />
              </div>
              <div class="mock-desc">
                <span class="mock-title">Create New Group</span>
                <span class="mock-sub">Start shared workspace streams</span>
              </div>
            </div>
            <div class="disabled-tag">MOCKED</div>
          </div>

          <!-- Add custom contact form -->
          <div class="settings-section glass-card-unified">
            <div class="section-header">Add Contact (Generates Real Chat)</div>
            <form @submit.prevent="onAddCustomContact" class="custom-contact-form">
              <div class="form-group">
                <input 
                  type="text" 
                  v-model="customName" 
                  placeholder="Full Name (e.g. Dan Abramov)" 
                  required 
                  class="form-input" 
                />
              </div>
              <div class="form-group">
                <input 
                  type="text" 
                  v-model="customPhone" 
                  placeholder="Phone or Username (e.g. @gaearon)" 
                  required
                  class="form-input" 
                />
              </div>
              <button type="submit" class="form-submit-btn">
                <UserPlus :size="14" />
                <span>Create Conversation</span>
              </button>
            </form>
          </div>

          <!-- Quick Connect Contacts -->
          <div class="settings-section glass-card-unified">
            <div class="section-header">Quick Connect (Instant Sync)</div>
            <div class="contacts-grid">
              <div 
                v-for="contact in contactList" 
                :key="contact.username"
                class="contact-grid-item ripple-on-click"
                @click="onConnectContact(contact)"
              >
                <div class="contact-avatar-box" :style="{ background: contact.color }">
                  {{ contact.avatar }}
                </div>
                <div class="contact-card-info">
                  <span class="contact-card-name">{{ contact.name }}</span>
                  <span class="contact-card-user">{{ contact.username }}</span>
                </div>
                <ArrowRight :size="14" class="contact-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Floating Glass Bottom Navigation Rail -->
    <nav class="glass-bottom-nav glass-panel-unified" id="vibes-bottom-nav">
      <!-- Floating New Story FAB absolutely aligned directly on top of the Profile button, just above it! -->
      <button 
        class="nav-story-fab-btn"
        @click.stop="triggerToast('Add to your story... 📸')"
        title="Add Story"
      >
        <Plus :size="12" class="story-fab-plus" />
      </button>

      <div class="nav-items-container">
        <!-- Tab 1: Chats -->
        <button 
          class="nav-tab-btn" 
          :class="{ active: activeTab === 'chats' }"
          @click="activeTab = 'chats'"
          type="button"
          aria-label="Chats feed"
        >
          <MessageSquare :size="18" class="tab-icon" />
          <span class="tab-label">Chats</span>
        </button>

        <!-- Tab 2: New Chat (Represented by elegant write / pen square icon) -->
        <button 
          class="nav-tab-btn" 
          :class="{ active: activeTab === 'new-chat' }"
          @click="activeTab = 'new-chat'"
          type="button"
          aria-label="New chat builder"
        >
          <SquarePen :size="18" class="tab-icon" />
          <span class="tab-label">New Chat</span>
        </button>

        <!-- Tab 3: Settings -->
        <button 
          class="nav-tab-btn" 
          :class="{ active: activeTab === 'settings' }"
          @click="activeTab = 'settings'"
          type="button"
          aria-label="App configuration"
        >
          <Settings :size="18" class="tab-icon" />
          <span class="tab-label">Settings</span>
        </button>

        <!-- Tab 4: Profile -->
        <button 
          class="nav-tab-btn" 
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
          type="button"
          aria-label="User profile settings"
        >
          <div class="tab-profile-avatar-box">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80" alt="Vibes" class="tab-profile-avatar-img" />
          </div>
          <span class="tab-label">Profile</span>
        </button>
      </div>
    </nav>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#imports'
import { useChat } from '~/composables/useChat'
import { 
  MessageSquare, 
  Settings, 
  User, 
  SquarePen, 
  Users, 
  UserPlus, 
  Phone, 
  Info, 
  ArrowRight,
  Plus
} from 'lucide-vue-next'

definePageMeta({
  layout: 'list'
})

const router = useRouter()
const { 
  chats, 
  activeChatId, 
  showSearch, 
  selectChat, 
  activeTab, 
  selectedTheme, 
  selectedAccent,
  messageBorder,
  messageRadius,
  addChat,
  triggerToast 
} = useChat()

// Form reference state for Add Custom Contact
const customName = ref('')
const customPhone = ref('')

// Preloaded contacts list for high fidelity dynamic Sync
const contactList = [
  { name: 'Dan Abramov', username: '@gaearon', avatar: 'DA', color: 'linear-gradient(135deg, #1fa2ff, #12d6df)' },
  { name: 'Guido van Rossum', username: '@gvanrossum', avatar: 'GR', color: 'linear-gradient(135deg, #ff9966, #ff5e62)' },
  { name: 'Rich Harris', username: '@rich_harris', avatar: 'RH', color: 'linear-gradient(135deg, #f12711, #f5af19)' },
  { name: 'Evan You', username: '@youyuxi', avatar: 'EY', color: 'linear-gradient(135deg, #11998e, #38ef7d)' }
]

onMounted(() => {
  activeChatId.value = null
})

const onChatSelect = (id: string) => {
  selectChat(id)
  showSearch.value = false
  router.push(`/${id}`)
}

const onConnectContact = (contact: { name: string; avatar: string }) => {
  // Check if a chat already exists with this contact name
  const existing = chats.value.find(c => c.name === contact.name)
  if (existing) {
    onChatSelect(existing.id)
    triggerToast(`Opened chat stream with ${contact.name}!`)
    activeTab.value = 'chats'
  } else {
    // Generate real new conversation
    const newId = addChat(contact.name, contact.avatar)
    onChatSelect(newId)
    triggerToast(`Dynamic channel synced with ${contact.name}! 📡`)
    activeTab.value = 'chats'
  }
}

const onAddCustomContact = () => {
  if (!customName.value.trim()) return
  const initials = customName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'C'
  const newId = addChat(customName.value.trim(), initials)
  
  // Transition
  onChatSelect(newId)
  triggerToast(`Created connection for ${customName.value.trim()}!`)
  
  // Reset Form
  customName.value = ''
  customPhone.value = ''
  activeTab.value = 'chats'
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

/* Master Scroller Area for sub-viewports */
.tab-scroller-content {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.sub-viewport-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 82px 8px 105px 8px; /* Reduced left/right to 8px; cleard bottom nav at 105px padding dynamically */
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

/* Fade in entering state */
.animate-fade-in {
  animation: tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes tabFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ------------------- PROFILE CARD DESIGN ------------------- */
.profile-view-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  align-items: center;
}

.profile-header-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 6px 0;
}

.large-profile-avatar-container {
  position: relative;
  margin-bottom: 12px;
}

.large-profile-avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2481cc, #00c6ff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.profile-online-badge {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-active);
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(52, 199, 89, 0.3);
  letter-spacing: 0.05em;
}

.profile-display-name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.profile-sub-online {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.profile-info-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.glass-card-unified {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 18px;
  padding: 14px 16px;
  width: 100%;
}

.info-card-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.card-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-icon {
  color: var(--color-accent-blue);
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.card-value {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.card-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-top: 2px;
}

.card-bio-text {
  font-size: 13.5px;
  color: var(--color-text-primary);
  line-height: 1.45;
  margin-top: 4px;
}


/* ------------------- SETTINGS DESIGN ------------------- */
.settings-view-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.section-master-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  padding-left: 2px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-accent-blue);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 8px;
}

.theme-picker-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.theme-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-button:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-2px);
}

.theme-button.active {
  background: rgba(36, 129, 204, 0.12);
  border-color: rgba(36, 129, 204, 0.4);
  box-shadow: 0 4px 12px rgba(36, 129, 204, 0.1);
}

.theme-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
}

.theme-color-preview.light {
  background: #f0f2f5;
}
.theme-color-preview.dark {
  background: #0e1621;
}
.theme-color-preview.oled {
  background: #000000;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Accent Color customizer */
.accent-picker-row {
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  padding: 4px 2px 8px 2px;
  scroll-behavior: smooth;
}

.accent-color-btn {
  flex: 1;
  min-width: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.accent-color-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-2.5px);
}

.accent-color-btn.active {
  background: rgba(36, 129, 204, 0.1);
  border-color: var(--color-accent-blue);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.accent-color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

.accent-color-btn.active .accent-color-dot {
  transform: scale(1.15);
  border-color: #ffffff;
  box-shadow: 0 0 10px var(--color-accent-blue);
}

.accent-color-name {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--color-text-primary);
  opacity: 0.9;
}

.accent-color-btn.active .accent-color-name {
  color: var(--color-accent-blue);
}

/* Chat styles elements */
.customizer-sub-block {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customizer-sub-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.customizer-grid-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.prefab-option-btn {
  flex: 1;
  min-width: 60px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
}

.prefab-option-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.prefab-option-btn.active {
  background: var(--color-accent-blue);
  color: #ffffff;
  border-color: var(--color-accent-blue);
  box-shadow: 0 0 8px var(--color-accent-blue);
}

/* Dynamic Previews */
.chat-customizer-preview-card {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-card-header {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
  padding-bottom: 6px;
}

.preview-bubbles-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.preview-bubble {
  max-width: 85%;
  padding: 8px 10px 5px 10px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.25s ease;
  border-style: var(--message-border-style, none);
  border-width: var(--message-border-width, 0px);
  border-color: rgba(255, 255, 255, 0.12);
}

.preview-bubble.them {
  background: #182533;
  color: #f5f5f7;
  align-self: flex-start;
  border-radius: var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-small, 6px);
}

.preview-bubble.me {
  background: #2b5278;
  color: #ffffff;
  align-self: flex-end;
  border-radius: var(--message-radius-val, 16px) var(--message-radius-val, 16px) var(--message-radius-small, 6px) var(--message-radius-val, 16px);
}

.preview-bubble-text {
  font-size: 12px;
  line-height: 1.4;
}

.preview-bubble-time {
  font-size: 9px;
  color: var(--color-text-muted);
  align-self: flex-end;
}

/* Setting Toggle items */
.setting-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 2px;
  cursor: pointer;
}

.setting-row-title {
  font-size: 13.5px;
  color: var(--color-text-primary);
}

.toggle-mock {
  width: 38px;
  height: 22px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.25s;
}

.toggle-mock::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1.5px 3px rgba(0, 0, 0, 0.3);
}

.toggle-mock.active {
  background: var(--color-active);
}

.toggle-mock.active::before {
  transform: translateX(16px);
}

.settings-footer-info {
  text-align: center;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.settings-footer-info p {
  font-size: 11px;
  color: var(--color-text-muted);
}


/* ------------------- NEW CHAT SCREEN DESIGN ------------------- */
.new-chat-view-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.disabled-mock-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0.65;
  cursor: not-allowed;
  position: relative;
  overflow: hidden;
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mock-icon-capsule {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-blue);
}

.mock-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mock-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.mock-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.disabled-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.05);
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

/* Custom Connection Form */
.custom-contact-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 2px;
}

.form-group {
  width: 100%;
}

.form-input {
  width: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px 14px;
  font-size: 13.5px;
  color: var(--color-text-primary);
  outline: none;
  font-family: var(--font-sans);
  transition: all 0.25s;
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(36, 129, 204, 0.4);
  box-shadow: 0 0 0 3px rgba(36, 129, 204, 0.08);
}

.form-submit-btn {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: var(--color-accent-blue);
  border: none;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(36, 129, 204, 0.2);
  transition: all 0.25s;
}

.form-submit-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

/* Contacts scrolling items grid */
.contacts-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-grid-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.contact-grid-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.contact-avatar-box {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 600;
  color: #ffffff;
}

.contact-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.contact-card-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.contact-card-user {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.contact-arrow {
  color: var(--color-text-muted);
  transition: transform 0.2s;
}

.contact-grid-item:hover .contact-arrow {
  transform: translateX(2px);
  color: var(--color-accent-blue);
}


/* ------------------- GENERAL NAV BAR FLOATING COMPONENT ------------------- */
.glass-bottom-nav {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 340px; /* Elegant, compact, not full-width */
  height: var(--glass-unit-size, 46px); /* EXACT Same height as header (46px) */
  z-index: 100;
  border-radius: 40px; /* Highly polished capsule corner radius */
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating New Story FAB absolutely aligned directly on top of the Profile button, just above it! */
.nav-story-fab-btn {
  position: absolute;
  top: -38px; /* Floats perfectly above bottom nav */
  right: 28px; /* Aligned symmetrically with the Profile avatar icon on the far right */
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent-blue);
  border: 1.5px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  z-index: 110;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
}

.nav-story-fab-btn:hover {
  transform: scale(1.15) rotate(90deg);
  background: var(--color-active);
}

.nav-story-fab-btn:active {
  transform: scale(0.95);
}

.story-fab-plus {
  display: block;
  opacity: 0.95;
}

/* Inner Container centering flex items */
.nav-items-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0 4px;
}

/* Individual tab buttons */
.nav-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  height: 100%;
  flex: 1;
  color: var(--color-text-secondary);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Active tab text / glow highlight state */
.nav-tab-btn.active {
  color: var(--color-accent-blue);
}

/* Styled User Profile Avatar container in Bottom Nav */
.tab-profile-avatar-box {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-tab-btn.active .tab-profile-avatar-box {
  border-color: var(--color-accent-blue);
  box-shadow: 0 0 6px rgb(36, 129, 204);
  transform: scale(1.1);
}

.tab-profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tab-icon {
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.25);
}

.nav-tab-btn:hover .tab-icon {
  transform: scale(1.1);
}

.nav-tab-btn.active .tab-icon {
  transform: scale(1.15) translateY(-1px);
}

.tab-label {
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: 0.8;
}

.nav-tab-btn.active .tab-label {
  opacity: 1;
  font-weight: 600;
}
</style>
