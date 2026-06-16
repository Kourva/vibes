<template>
  <div class="page-container" id="list-page">
    <ChatList 
      :chats="chats"
      :show-search="showSearch"
      @select="onChatSelect"
      @create="handleCreateChat"
      @close-search="showSearch = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'
import { useRouter } from '#imports'
import { onMounted } from 'vue'

definePageMeta({
  layout: 'list'
})

const router = useRouter()
const { chats, activeChatId, showSearch, selectChat, addChat, triggerToast } = useChat()

onMounted(() => {
  activeChatId.value = null
})

const onChatSelect = (id: string) => {
  selectChat(id)
  showSearch.value = false
  router.push(`/${id}`)
}

const handleCreateChat = (name: string) => {
  const newId = addChat(name)
  selectChat(newId)
  router.push(`/${newId}`)
  triggerToast(`Started new conversation with ${name}! 💬`)
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
