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
  image?: string
  senderName?: string
  date?: string
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
  pinned?: boolean
  isGroup?: boolean
}

// Global or shared reactive state to ensure values persist across view transitions
const activeChatId = ref<string | null>(null)
const toastMessage = ref('')
const showSearch = ref(false)
const searchQuery = ref('')
const emojiOpen = ref(false)
const storiesMovedToBottom = ref(false)
const activeTab = ref<'chats' | 'new-chat' | 'settings' | 'profile'>('chats')
const selectedTheme = ref<'light' | 'dark' | 'oled'>('dark')
const selectedAccent = ref<'blue' | 'emerald' | 'purple' | 'amber' | 'crimson'>('blue')
const messageBorder = ref<'none' | 'solid' | 'dashed' | 'dotted' | 'double'>('none')
const messageRadius = ref<'dense' | 'standard' | 'extra'>('standard')

if (import.meta.client) {
  const savedTheme = localStorage.getItem('vibes-theme') as 'light' | 'dark' | 'oled'
  if (savedTheme) {
    selectedTheme.value = savedTheme
  }
  const savedAccent = localStorage.getItem('vibes-accent') as 'blue' | 'emerald' | 'purple' | 'amber' | 'crimson'
  if (savedAccent) {
    selectedAccent.value = savedAccent
  }
  const savedBorder = localStorage.getItem('vibes-message-border') as 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
  if (savedBorder) {
    messageBorder.value = savedBorder
  }
  const savedRadius = localStorage.getItem('vibes-message-radius') as 'dense' | 'standard' | 'extra'
  if (savedRadius) {
    messageRadius.value = savedRadius
  }
}

watch(selectedTheme, (val) => {
  if (import.meta.client) {
    localStorage.setItem('vibes-theme', val)
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-oled')
    document.body.classList.add(`theme-${val}`)

    // Sync PWA theme-color & Apple meta tags beautifully
    const colorMap = {
      light: '#f0f2f5',
      dark: '#0e1621',
      oled: '#000000'
    }
    const colorVal = colorMap[val] || '#0e1621'
    let metaTheme = document.querySelector('meta[name="theme-color"]')
    if (!metaTheme) {
      metaTheme = document.createElement('meta')
      metaTheme.setAttribute('name', 'theme-color')
      document.head.appendChild(metaTheme)
    }
    metaTheme.setAttribute('content', colorVal)
  }
}, { immediate: true })

watch(selectedAccent, (val) => {
  if (import.meta.client) {
    localStorage.setItem('vibes-accent', val)
    const colors = {
      blue: '#2481cc',
      emerald: '#34c759',
      purple: '#da22ff', // A cooler design-oriented violet
      amber: '#f5af19',
      crimson: '#ff416c'
    }
    const color = colors[val] || colors.blue
    document.documentElement.style.setProperty('--color-accent-blue', color)
  }
}, { immediate: true })

watch(messageBorder, (val) => {
  if (import.meta.client) {
    localStorage.setItem('vibes-message-border', val)
    document.documentElement.style.setProperty('--message-border-style', val === 'none' ? 'none' : val)
    const widths = {
      none: '0px',
      solid: '1px',
      dashed: '1.5px',
      dotted: '1.5px',
      double: '3px'
    }
    document.documentElement.style.setProperty('--message-border-width', widths[val] || '0px')
  }
}, { immediate: true })

watch(messageRadius, (val) => {
  if (import.meta.client) {
    localStorage.setItem('vibes-message-radius', val)
    const radii = {
      dense: { large: '6px', small: '2px' },
      standard: { large: '16px', small: '6px' },
      extra: { large: '24px', small: '10px' }
    }
    const current = radii[val] || radii.standard
    document.documentElement.style.setProperty('--message-radius-val', current.large)
    document.documentElement.style.setProperty('--message-radius-small', current.small)
  }
}, { immediate: true })

const stories = ref([
  { id: 'st1', name: 'Elena', avatar: 'E', color: 'linear-gradient(135deg, #38ef7d, #11998e)', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', storiesCount: 3, unseenCount: 2 },
  { id: 'st2', name: 'Seraphina', avatar: 'S', color: 'linear-gradient(135deg, #ff416c, #ff4b2b)', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', storiesCount: 1, unseenCount: 1 },
  { id: 'st3', name: 'Sora Tanaka', avatar: 'T', color: 'linear-gradient(135deg, #1fa2ff, #12d6df)', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', storiesCount: 5, unseenCount: 0 },
  { id: 'st4', name: 'Alex M.', avatar: 'A', color: 'linear-gradient(135deg, #f857a6, #ff5858)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', storiesCount: 2, unseenCount: 2 },
  { id: 'st5', name: 'Chloe Ma', avatar: 'C', color: 'linear-gradient(135deg, #f12711, #f5af19)', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', storiesCount: 4, unseenCount: 3 },
  { id: 'st6', name: 'Marcus V.', avatar: 'M', color: 'linear-gradient(135deg, #00c6ff, #0072ff)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', storiesCount: 3, unseenCount: 0 }
])

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
    id: 'group1',
    name: '🎨 Art & UI Designers Group',
    avatar: 'G',
    status: '8 members, 5 online',
    pinned: true,
    isGroup: true,
    avatarColor: 'linear-gradient(135deg, #da22ff, #9733ee)',
    messages: [
      {
        id: 'g1',
        text: 'Hey designers! Welcome to our gorgeous Glassmorphic workspace group! 🎨✨',
        sender: 'them',
        senderName: 'Elena Pavlova',
        time: '12:30',
        date: 'Yesterday'
      },
      {
        id: 'g2',
        text: 'Does everyone like the custom Telegram-style consecutive message grouping?',
        sender: 'them',
        senderName: 'Elena Pavlova',
        time: '12:31',
        date: 'Yesterday'
      },
      {
        id: 'g3',
        text: 'Oh absolutely, it is extremely custom-crafted. No redundant avatars or clutter, purely content-dense!',
        sender: 'me',
        time: '12:35',
        date: 'Yesterday',
        status: 'read'
      },
      {
        id: 'g4',
        text: 'Yes! And check how the message bubble corners dynamically adjust to point inward or outward based on their index sequence in a conversation! 🌊🚀',
        sender: 'them',
        senderName: 'Julian Rose',
        time: '14:20',
        date: 'Today'
      },
      {
        id: 'g5',
        text: 'It is incredibly sleek. Let me attach our newly approved design preview model so you can check how image blocks behave!',
        sender: 'them',
        senderName: 'Sora Tanaka',
        time: '14:22',
        date: 'Today',
        image: 'https://images.unsplash.com/photo-1618005198143-d366763f04f2?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'g6',
        text: 'Wow, Sora! This render looks beautiful! The fullscreen lightbox zoom is pristine! 🤍🤩',
        sender: 'them',
        senderName: 'Elena Pavlova',
        time: '14:25',
        date: 'Today'
      },
      {
        id: 'g7',
        text: 'Let\'s make sure the scroll spring alignment fits perfectly inside the screen width limits.',
        sender: 'them',
        senderName: 'Elena Pavlova',
        time: '14:26',
        date: 'Today'
      },
      {
        id: 'g8',
        text: 'Yes, I just updated the margins and padding bottom to fit beautifully!',
        sender: 'me',
        time: '14:28',
        date: 'Today',
        status: 'read'
      },
      {
        id: 'g9',
        text: 'And check how our sticky timeline is pinned precisely directly under the profile head!',
        sender: 'me',
        time: '14:29',
        date: 'Today',
        status: 'read'
      },
      {
        id: 'g10',
        text: '',
        sender: 'them',
        senderName: 'Julian Rose',
        time: '14:31',
        date: 'Today',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'g11',
        text: 'Oh my goodness, Julian, this artwork represents our abstract theme wonderfully!',
        sender: 'them',
        senderName: 'Elena Pavlova',
        time: '14:33',
        date: 'Today',
        replyTo: {
          id: 'g10',
          text: '',
          sender: 'them',
          senderName: 'Julian Rose'
        }
      },
      {
        id: 'g12',
        text: 'Agreed! Perfect blending of borders and translucent shaders.',
        sender: 'me',
        time: '14:35',
        date: 'Today',
        status: 'read'
      }
    ]
  },
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
        time: '18:41',
        date: 'June 15'
      },
      {
        id: 's2',
        text: 'Oh wow, look at those glassy containers! Is this real frosted liquid glass with reflections?',
        sender: 'me',
        time: '18:42',
        date: 'June 15',
        status: 'read'
      },
      {
        id: 's3',
        text: 'Absolutely! Hover over the elements or scroll. The backdrop blur matches our animated liquid background in real-time.',
        sender: 'them',
        time: '18:43',
        date: 'June 15',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 's4',
        text: 'This looks incredibly futuristic. Let’s try typing some more messages and see how the layout handles it.',
        sender: 'me',
        time: '18:45',
        date: 'Yesterday',
        status: 'read'
      },
      {
        id: 's5',
        text: 'Type anything in the central bar, then press send or hit Enter. The right action changes from microphone to send arrow automatically ✨',
        sender: 'them',
        time: '18:45',
        date: 'Yesterday',
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
        date: 'Yesterday',
        status: 'read'
      },
      {
        id: 's7',
        text: 'Yes! And notice the bottom layout splits emoji and file attachment on the left, input in the center, and voice/send at the right side.',
        sender: 'them',
        time: '18:47',
        date: 'Today',
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
        date: 'Today',
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
        time: '18:49',
        date: 'Today'
      },
      {
        id: 's10',
        text: 'I just replied to your beautiful gradient background photo! Check how cleanly the reply header renders it!',
        sender: 'me',
        time: '18:51',
        date: 'Today',
        status: 'read',
        replyTo: {
          id: 's3',
          text: '',
          sender: 'them',
          senderName: 'Seraphina'
        }
      },
      {
        id: 's11',
        text: '',
        sender: 'them',
        time: '18:53',
        date: 'Today',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 's12',
        text: 'This is brilliant, the photo with reply block renders with flawless, simple non-ugly corners and correct padding!',
        sender: 'me',
        time: '18:55',
        date: 'Today',
        status: 'read',
        replyTo: {
          id: 's11',
          text: '',
          sender: 'them',
          senderName: 'Seraphina'
        }
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
        time: '14:24',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80'
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

  const sendMessage = (text: string, imageUrl?: string) => {
    if ((!text.trim() && !imageUrl) || !activeChat.value) return

    const newId = String(Date.now())
    const messageTime = formatTime()
    
    // Check if replying to a message
    const replyMeta = replyingTo.value ? {
      id: replyingTo.value.id,
      text: replyingTo.value.text || (replyingTo.value.image ? '📷 Photo' : ''),
      sender: replyingTo.value.sender,
      senderName: replyingTo.value.sender === 'me' ? 'You' : (replyingTo.value.senderName || activeChat.value.name)
    } : undefined

    // Add my message
    activeChat.value.messages.push({
      id: newId,
      text: text,
      sender: 'me',
      time: messageTime,
      status: 'sending',
      replyTo: replyMeta,
      image: imageUrl,
      date: 'Today'
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
    if (targetChat.isGroup) {
      const typers = ['Elena Pavlova', 'Sora Tanaka', 'Julian Rose', 'Kaelen O\'Neal']
      const count = Math.random() > 0.55 ? 2 : 1
      const selectedTypers: string[] = []
      while (selectedTypers.length < count) {
        const typer = typers[Math.floor(Math.random() * typers.length)]
        if (!selectedTypers.includes(typer)) {
          selectedTypers.push(typer)
        }
      }
      targetChat.status = selectedTypers.length === 2
        ? `${selectedTypers[0]}, ${selectedTypers[1]} are typing...`
        : `${selectedTypers[0]} is typing...`
    } else {
      targetChat.status = 'typing...'
    }
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
      targetChat.status = targetChat.isGroup ? '8 members, 5 online' : 'online'
      
      let replyMeta = undefined
      if (Math.random() > 0.65) {
        const myMessages = targetChat.messages.filter(m => m.sender === 'me')
        if (myMessages.length > 0) {
          const target = myMessages[myMessages.length - 1]
          replyMeta = {
            id: target.id,
            text: target.text || (target.image ? '📷 Photo' : ''),
            sender: target.sender,
            senderName: 'You'
          }
        }
      }

      let senderName = undefined
      if (targetChat.isGroup) {
        const members = ['Elena Pavlova', 'Sora Tanaka', 'Julian Rose', 'Kaelen O\'Neal']
        senderName = members[Math.floor(Math.random() * members.length)]
      }

      targetChat.messages.push({
        id: String(Date.now() + 1),
        text: randomResponse,
        sender: 'them',
        time: formatTime(),
        replyTo: replyMeta,
        senderName,
        date: 'Today'
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

  const togglePin = (id: string) => {
    const chat = chats.value.find(c => c.id === id)
    if (chat) {
      chat.pinned = !chat.pinned
      triggerToast(chat.pinned ? `Pinned "${chat.name}"!` : `Unpinned "${chat.name}"`)
    }
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
    storiesMovedToBottom,
    activeTab,
    selectedTheme,
    selectedAccent,
    messageBorder,
    messageRadius,
    stories,
    sendMessage,
    setReplyingTo,
    deleteMessage,
    chatContainerRef,
    selectChat,
    addChat,
    scrollContainerToBottom,
    triggerToast,
    togglePin
  }
}
