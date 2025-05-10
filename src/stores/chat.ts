import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatService, type Chat, type Message } from '../services/chat'
import { ErrorHandler } from '@/utils/errorHandler'

export const useChatStore = defineStore('chat', () => {
  const chats = ref<Chat[]>([])
  const activeChatId = ref<string>('')
  const searchQuery = ref('')
  const chatService = new ChatService()

  const filteredChats = computed(() => {
    if (!searchQuery.value) return chats.value
    return chats.value.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  const activeChat = computed(() => chats.value.find((chat) => chat.id === activeChatId.value))

  const getMessagesByChatId = () => {
    return activeChat.value?.messages || []
  }

  const initChats = async () => {
    await chatService.initializeDefaultChat()
    await loadChats()
  }

  const loadChats = async () => {
    const loadedChats = await chatService.getChats()
    chats.value = loadedChats || []
  }

  const createChat = async (title: string) => {
    const newChat = {
      title,
      messages: [],
      createdAt: new Date().toISOString(),
    }
    const id = await chatService.createChat(newChat)
    await loadChats()
    return id
  }

  const updateChat = async (id: string, updates: Partial<Chat>) => {
    await chatService.updateChat(id, updates)
    await loadChats()
  }

  const deleteChat = async (id: string) => {
    await chatService.deleteChat(id)
    await loadChats()
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id || ''
    }
  }

  const setActiveChat = (id: string) => {
    activeChatId.value = id
  }

  const addMessage = async (message: Omit<Message, 'id'>) => {
    if (!activeChatId.value) {
      ErrorHandler.showError('No active chat')
    }
    const messageId = await chatService.addMessageToChat(activeChatId.value, message)
    await loadChats()
    return messageId
  }

  const updateMessage = async (message: Message) => {
    if (!activeChatId.value) {
      ErrorHandler.showError('No active chat')
    }
    const chat = ((await chatService.getChats()) || []).find((c) => c.id === activeChatId.value)
    if (!chat) {
      ErrorHandler.showError('Chat not found')
      return
    }
    const updatedMessages = chat.messages.map((m) =>
      m.id === message.id ? { ...m, ...message } : m,
    )
    await chatService.updateChat(activeChatId.value, {
      messages: JSON.parse(JSON.stringify(updatedMessages)),
    })
    await loadChats()
  }

  return {
    chats,
    filteredChats,
    activeChat,
    activeChatId,
    searchQuery,
    getMessagesByChatId,
    initChats,
    loadChats,
    createChat,
    updateChat,
    deleteChat,
    addMessage,
    setActiveChat,
    updateMessage,
  }
})
