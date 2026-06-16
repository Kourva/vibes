import { ref, nextTick, computed } from 'vue'

export interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  time: string
  status?: 'sent' | 'read' | 'sending'
  replyTo?: {
    id: string
    text: string
    sender: 'me' | 'them'
    senderName: string
  }
}

export interface UserProfile {
  name: string
  avatar: string
  status: string
  avatarColor: string
}

export interface Chat {
  id: string
  name: string
  avatar: string
  avatarColor: string
  status: string
  messages: Message[]
  unreadCount?: number
}

// Global or shared reactive state to ensure values persist across view transitions
const activeChatId = ref<string | null>(null)
const toastMessage = ref('')
const showSearch = ref(false)
const searchQuery = ref('')
const emojiOpen = ref(false)

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const triggerToast = (msg: string) => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = msg
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 2300)
}

const chats = ref<Chat[]>([
  {
    id: '1',
    name: 'Seraphina',
    avatar: 'S',
    status: 'online',
    avatarColor: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
    messages: [
      {
        id: 's1',
        text: 'Hey there! Welcome to the new Glassmorphic Chat interface 🌊',
        sender: 'them',
        time: '18:41'
      },
      {
        id: 's2',
        text: 'Oh wow, look at those glassy containers! Is this real frosted liquid glass with reflections?',
        sender: 'me',
        time: '18:42',
        status: 'read'
      },
      {
        id: 's3',
        text: 'Absolutely! Hover over the elements or scroll. The backdrop blur matches our animated liquid background in real-time.',
        sender: 'them',
        time: '18:43'
      },
      {
        id: 's4',
        text: 'This looks incredibly futuristic. Let’s try typing some more messages and see how the layout handles it.',
        sender: 'me',
        time: '18:45',
        status: 'read'
      },
      {
        id: 's5',
        text: 'Type anything in the central bar, then press send or hit Enter. The right action changes from microphone to send arrow automatically ✨',
        sender: 'them',
        time: '18:45',
        replyTo: {
          id: 's4',
          text: 'This looks incredibly futuristic. Let’s try typing some more messages and see how the layout handles it.',
          sender: 'me',
          senderName: 'You'
        }
      },
      {
        id: 's6',
        text: 'Look at the circular action buttons in the separated header! Solid 40px circles on the sides and a beautiful capsule in the middle.',
        sender: 'me',
        time: '18:46',
        status: 'read'
      },
      {
        id: 's7',
        text: 'Yes! And notice the bottom layout splits emoji and file attachment on the left, input in the center, and voice/send at the right side.',
        sender: 'them',
        time: '18:47',
        replyTo: {
          id: 's6',
          text: 'Look at the circular action buttons in the separated header! Solid 40px circles on the sides and a beautiful capsule in the middle.',
          sender: 'me',
          senderName: 'You'
        }
      },
      {
        id: 's8',
        text: 'The micro-animations when messages pop in are incredibly pleasing. They have a gorgeous soft bounce.',
        sender: 'me',
        time: '18:48',
        status: 'read',
        replyTo: {
          id: 's7',
          text: 'Yes! And notice the bottom layout splits emoji and file attachment on the left, input in the center, and voice/send at the right side.',
          sender: 'them',
          senderName: 'Seraphina'
        }
      },
      {
        id: 's9',
        text: 'That is the beauty of carefully calculated keyframes. Try scrolling up right now to test the frosted scroll-to-bottom FAB! 👇',
        sender: 'them',
        time: '18:49'
      }
    ]
  },
  {
    id: '2',
    name: 'Julian Rose',
    avatar: 'J',
    status: 'online',
    avatarColor: 'linear-gradient(135deg, #1fa2ff, #12d6df)',
    unreadCount: 2,
    messages: [
      {
        id: 'j1',
        text: 'Are we still on for checking the new liquid glassy shader controls?',
        sender: 'them',
        time: '14:20'
      },
      {
        id: 'j2',
        text: 'Definitely. I am previewing the beautiful translucent reflections right now.',
        sender: 'me',
        time: '14:22',
        status: 'read'
      },
      {
        id: 'j3',
        text: 'Perfect! Let me know if we need to refine the layout padding size or curve rounding.',
        sender: 'them',
        time: '14:23'
      },
      {
        id: 'j4',
        text: 'I will send over the screenshots in a few minutes!',
        sender: 'them',
        time: '14:24'
      }
    ]
  },
  {
    id: '3',
    name: 'Aurora Aura',
    avatar: 'A',
    status: 'offline',
    avatarColor: 'linear-gradient(135deg, #b3ffab, #12fff7)',
    messages: [
      {
        id: 'a1',
        text: 'That UI mock looks incredibly clean! Let me know when you are free to chat about it.',
        sender: 'them',
        time: 'Yesterday'
      }
    ]
  },
  {
    id: '4',
    name: 'Zephyr Wind',
    avatar: 'Z',
    status: 'online',
    avatarColor: 'linear-gradient(135deg, #da22ff, #9733ee)',
    unreadCount: 1,
    messages: [
      {
        id: 'z1',
        text: 'I just pushed the latest glass theme enhancements and visual touch-up coordinates to main.',
        sender: 'them',
        time: 'Monday'
      }
    ]
  },
  {
    id: '5',
    name: 'Nova Stella',
    avatar: 'N',
    status: 'online',
    avatarColor: 'linear-gradient(135deg, #f21b3f, #ff9900)',
    messages: [
      {
        id: 'n1',
        text: 'This glassy theme is easily the coolest interactive mockup I have seen this year! Pure artistry.',
        sender: 'them',
        time: 'May 28'
      }
    ]
  },
  {
    id: '6',
    name: 'Celeste Blue',
    avatar: 'C',
    status: 'offline',
    avatarColor: 'linear-gradient(135deg, #11998e, #38ef7d)',
    messages: [
      {
        id: 'c1',
        text: 'Can we schedule a short screen-share session to go over the design parameters tomorrow?',
        sender: 'them',
        time: 'May 24'
      }
    ]
  },
  {
    id: '7',
    name: 'Lyra Spark',
    avatar: 'L',
    status: 'online',
    avatarColor: 'linear-gradient(135deg, #ff0844, #ffb199)',
    messages: [
      {
        id: 'l1',
        text: 'Outstanding attention to details on the curves and spacing. Outstanding job!',
        sender: 'them',
        time: 'May 20'
      }
    ]
  },
  {
    id: '8',
    name: 'Orion Glass',
    avatar: 'O',
    status: 'online',
    avatarColor: 'linear-gradient(135deg, #3a7bd5, #3a6073)',
    messages: [
      {
        id: 'o1',
        text: 'Looking forward to the feedback loop on this mockup.',
        sender: 'them',
        time: 'May 18'
      }
    ]
  },
  {
    id: '9',
    name: 'Iris Prism',
    avatar: 'I',
    status: 'offline',
    avatarColor: 'linear-gradient(135deg, #f857a6, #ff5858)',
    messages: [
      {
        id: 'i1',
        text: 'Wait! Did we add the emoji picker in yet? It looks super clean.',
        sender: 'them',
        time: 'May 15'
      }
    ]
  }
])

const replyingTo = ref<Message | null>(null)
const chatContainerRef = ref<HTMLElement | null>(null)

export function useChat() {
  const activeChat = computed(() => {
    return chats.value.find(c => c.id === activeChatId.value) || null
  })

  const profile = computed<UserProfile>(() => {
    if (activeChat.value) {
      return {
        name: activeChat.value.name,
        avatar: activeChat.value.avatar,
        status: activeChat.value.status,
        avatarColor: activeChat.value.avatarColor
      }
    }
    // Fallback profile if none active (though we would be in list view anyway)
    return {
      name: 'System',
      avatar: 'S',
      status: 'offline',
      avatarColor: 'linear-gradient(135deg, #ccc, #999)'
    }
  })

  const messages = computed<Message[]>(() => {
    return activeChat.value ? activeChat.value.messages : []
  })

  const isTyping = computed(() => {
    return activeChat.value ? activeChat.value.status === 'typing...' : false
  })

  const formatTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const deleteMessage = (id: string) => {
    if (activeChat.value) {
      activeChat.value.messages = activeChat.value.messages.filter(msg => msg.id !== id)
    }
  }

  const scrollContainerToBottom = async () => {
    await nextTick()
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTo({
        top: chatContainerRef.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const setReplyingTo = (message: Message | null) => {
    replyingTo.value = message
  }

  const sendMessage = (text: string) => {
    if (!text.trim() || !activeChat.value) return

    const newId = String(Date.now())
    const messageTime = formatTime()
    
    // Check if replying to a message
    const replyMeta = replyingTo.value ? {
      id: replyingTo.value.id,
      text: replyingTo.value.text,
      sender: replyingTo.value.sender,
      senderName: replyingTo.value.sender === 'me' ? 'You' : activeChat.value.name
    } : undefined

    // Add my message
    activeChat.value.messages.push({
      id: newId,
      text: text,
      sender: 'me',
      time: messageTime,
      status: 'sending',
      replyTo: replyMeta
    })

    // Reset replying state
    replyingTo.value = null
    scrollContainerToBottom()

    // Simulate sending progress
    const currentChat = activeChat.value
    setTimeout(() => {
      const msg = currentChat.messages.find(m => m.id === newId)
      if (msg) msg.status = 'sent'
      
      // Trigger a lovely interactive reply
      startTypingResponse(currentChat)
    }, 800)
  }

  const startTypingResponse = (targetChat: Chat) => {
    targetChat.status = 'typing...'
    scrollContainerToBottom()

    const responses = [
      "I love how smooth the message animations feel! 🚀",
      "Notice how the glass reflects ambient light on top of the moving gradient?",
      "Every single component here is an independent glassy bubble! It's so clean 🌌",
      "We've crafted it using pure CSS and Nuxt 4, exactly as you wanted! Type some more!",
      "Should we build message reaction cards next? I'm ready to continue whenever you are."
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    setTimeout(() => {
      targetChat.status = 'online'
      
      let replyMeta = undefined
      if (Math.random() > 0.65) {
        const myMessages = targetChat.messages.filter(m => m.sender === 'me')
        if (myMessages.length > 0) {
          const target = myMessages[myMessages.length - 1]
          replyMeta = {
            id: target.id,
            text: target.text,
            sender: target.sender,
            senderName: 'You'
          }
        }
      }

      targetChat.messages.push({
        id: String(Date.now() + 1),
        text: randomResponse,
        sender: 'them',
        time: formatTime(),
        replyTo: replyMeta
      })
      scrollContainerToBottom()
    }, 2000)
  }

  const selectChat = (id: string) => {
    activeChatId.value = id
    // Clear unread count
    const chat = chats.value.find(c => c.id === id)
    if (chat) {
      chat.unreadCount = 0
    }
    scrollContainerToBottom()
  }

  const addChat = (name: string) => {
    const initials = name.trim() ? name.charAt(0).toUpperCase() : 'N'
    const gradients = [
      'linear-gradient(135deg, #1fa2ff, #12d6df)',
      'linear-gradient(135deg, #ff416c, #ff4b2b)',
      'linear-gradient(135deg, #b3ffab, #12fff7)',
      'linear-gradient(135deg, #da22ff, #9733ee)',
      'linear-gradient(135deg, #f21b3f, #ff9900)',
      'linear-gradient(135deg, #11998e, #38ef7d)',
      'linear-gradient(135deg, #f857a6, #ff5858)'
    ]
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]
    const newChatId = String(Date.now())
    chats.value.unshift({
      id: newChatId,
      name,
      avatar: initials,
      status: 'online',
      avatarColor: randomGradient,
      messages: [
        {
          id: String(Date.now() + 2),
          text: `Hey, this is ${name}! Super excited to connect on this glorious glassy app! 🚀`,
          sender: 'them',
          time: formatTime()
        }
      ]
    })
    return newChatId
  }

  return {
    chats,
    activeChatId,
    activeChat,
    profile,
    messages,
    replyingTo,
    isTyping,
    toastMessage,
    showSearch,
    searchQuery,
    emojiOpen,
    sendMessage,
    setReplyingTo,
    deleteMessage,
    chatContainerRef,
    selectChat,
    addChat,
    scrollContainerToBottom,
    triggerToast
  }
}
