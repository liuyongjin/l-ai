export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant'
  content: string
  error?: boolean
  createdAt: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}

import Dexie from 'dexie'

export class ChatService {
  private db: Dexie
  private chats: Dexie.Table<Chat, string>
  private isInitialized = false

  constructor() {
    this.db = new Dexie('ChatDatabase')
    this.db.version(1).stores({
      chats: 'id,title,messages',
    })
    this.chats = this.db.table('chats')
  }

  async getChats(): Promise<Chat[]> {
    return await this.chats.toArray()
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return await this.chats.get(id)
  }

  async createChat(chat: Omit<Chat, 'id'>): Promise<string> {
    const id = crypto.randomUUID()
    await this.chats.add({ ...chat, id })
    return id
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<void> {
    await this.chats.update(id, updates)
  }

  async deleteChat(id: string): Promise<void> {
    await this.chats.delete(id)
  }

  async addMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<string> {
    const chat = await this.getChat(chatId)
    if (!chat) throw new Error('Chat not found')

    const messageId = crypto.randomUUID()
    const newMessage: Message = {
      ...message,
      id: messageId,
      chatId,
      createdAt: new Date().toISOString(),
    }

    await this.updateChat(chatId, {
      messages: [...chat.messages, newMessage],
    })
    return messageId
  }

  async initializeDefaultChat(): Promise<void> {
    if (this.isInitialized) return

    const existingChats = await this.chats.toArray()
    if (existingChats.length === 0) {
      await this.createChat({
        title: '新对话',
        messages: [],
        createdAt: new Date().toISOString(),
      })
    }
    this.isInitialized = true
  }
}
