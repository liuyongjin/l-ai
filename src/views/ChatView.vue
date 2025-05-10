<template>
  <div class="chat-container">
    <div class="overlay" v-if="drawerVisible" @click="toggleSidebar"></div>
    <ChatSidebar
      :drawerVisible="drawerVisible"
      @showDeleteConfirm="showDeleteConfirm"
      @createChat="createChat"
    />
    <ChatMain
      ref="chatMainRef"
      :toggleSidebar="toggleSidebar"
      :activeChatId="activeChatId"
      :scrollToBottom="scrollToBottom"
    />
  </div>
  <el-dialog
    v-model="showCreateDialog"
    :title="$t('chat.newChat')"
    width="50%"
    :close-on-click-modal="false"
  >
    <el-input
      v-model="newChatTitle"
      :placeholder="$t('chat.newChatPlaceholder')"
      @keyup.enter="confirmCreate"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showCreateDialog = false">{{ $t('chat.cancel') }}</el-button>
        <el-button type="primary" @click="confirmCreate">{{ $t('chat.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    v-model="showDeleteDialog"
    :title="$t('chat.deleteChat')"
    width="50%"
    :close-on-click-modal="false"
  >
    <span>{{ $t('chat.confirmDelete') }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelDelete">{{ $t('chat.cancel') }}</el-button>
        <el-button type="danger" @click="confirmDelete">{{ $t('chat.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatMain from '@/components/ChatMain.vue'
import { useI18n } from 'vue-i18n'
import { ErrorHandler } from '@/utils/errorHandler'

const { t } = useI18n()
const drawerVisible = ref(false)

const toggleSidebar = () => {
  drawerVisible.value = !drawerVisible.value
}

const chatStore = useChatStore()
const chatMainRef = ref<InstanceType<typeof ChatMain> | null>(null)
const chats = computed(() => chatStore.filteredChats)
const activeChatId = computed(() => chatStore.activeChatId)

const showCreateDialog = ref(false)
const newChatTitle = ref('')

const createChat = async () => {
  showCreateDialog.value = true
}

const confirmCreate = async () => {
  if (newChatTitle.value.trim()) {
    const id = await chatStore.createChat(newChatTitle.value.trim())
    chatStore.setActiveChat(id)
    showCreateDialog.value = false
    newChatTitle.value = ''
  }
}

const deleteChat = (chatId: string) => {
  try {
    chatStore.deleteChat(chatId)
    ErrorHandler.showSuccess(t('chat.deleteSuccess'))
  } catch (error) {
    console.error(error)
    ErrorHandler.showError(t('chat.deleteFailed'))
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const messagesContainer = chatMainRef.value?.messagesContainer
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  })
}

onMounted(async () => {
  try {
    await chatStore.loadChats()
    if (chats.value.length === 0) {
      await chatStore.initChats()
    }
    if (!activeChatId.value && chats.value.length > 0) {
      chatStore.setActiveChat(chats.value[0].id)
    }
    scrollToBottom()
  } catch (error) {
    console.error(error)
  }
})

const showDeleteDialog = ref(false)
const chatToDelete = ref('')

const showDeleteConfirm = (chatId: string) => {
  chatToDelete.value = chatId
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (chatToDelete.value) {
    deleteChat(chatToDelete.value)
    showDeleteDialog.value = false
    chatToDelete.value = ''
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  chatToDelete.value = ''
}
</script>

<style scoped lang="scss">
@use '../assets/styles/mixins.scss' as *;

.chat-container {
  display: flex;
  height: 100vh;
  position: relative;
  background-color: var(--bg-dark);
  color: var(--text-dark-primary);

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: var(--z-index-overlay);
  }

  @include not-mobile {
    .overlay {
      display: none;
    }
  }
}
</style>
