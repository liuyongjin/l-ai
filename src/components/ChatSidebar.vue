<template>
  <div class="chat-sidebar" :class="{ show: drawerVisible }">
    <div class="sidebar-header">
      <el-input
        class="search-box"
        v-model="searchInput"
        :placeholder="$t('chat.searchPlaceholder')"
        @input="updateSearch"
        clearable
      >
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="createChat" class="new-chat-btn">
        <el-icon class="plus-icon"><CirclePlus /></el-icon>
        {{ $t('chat.newChat') }}
      </el-button>
    </div>
    <div class="chat-list">
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="chat-item"
        :class="{ active: activeChatId === chat.id }"
        @click="selectChat(chat.id)"
      >
        <el-icon class="chat-icon"><ChatLineRound :color="PRIMARY_COLOR" /></el-icon>
        <span class="chat-title" :title="chat.title">{{ chat.title }}</span>
        <el-icon
          class="delete-btn"
          :class="{ 'hide-btn': chats.length <= 1 }"
          @click.stop="chats.length > 1 ? showDeleteConfirm(chat.id) : null"
        >
          <Delete />
        </el-icon>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Delete, ChatLineRound, CirclePlus } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import { PRIMARY_COLOR } from '@/constants'

defineProps({
  drawerVisible: Boolean,
})
const emit = defineEmits(['showDeleteConfirm', 'createChat'])

const chatStore = useChatStore()
const searchInput = ref('')

const chats = computed(() => chatStore.filteredChats)
const activeChatId = computed(() => chatStore.activeChatId)

const updateSearch = (event: string) => {
  chatStore.searchQuery = event
}

const selectChat = (chatId: string) => {
  chatStore.setActiveChat(chatId)
}

const showDeleteConfirm = (chatId: string) => {
  emit('showDeleteConfirm', chatId)
}

const createChat = () => {
  emit('createChat')
}
</script>

<style scoped lang="scss">
@use '../assets/styles/mixins.scss' as *;

.chat-sidebar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 280px;
  border-right: 1px solid var(--border-dark);
  transition: transform 0.3s ease;

  .sidebar-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-dark);
  }

  .search-box {
    height: 38px;
    margin-bottom: 16px;
    :deep(.el-input__wrapper) {
      background-color: var(--bg-dark);
    }
    :deep(.el-input__inner) {
      color: var(--text-dark-primary);
    }
  }

  .new-chat-btn {
    width: 100%;
    padding: 12px;
    height: auto;
    .plus-icon {
      font-size: 20px;
      margin-right: 8px;
    }
  }

  .chat-list {
    flex: 1;
    padding: 16px;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border-radius: var(--border-radius-md);

    &.active {
      font-weight: 600;
      background-color: var(--bg-dark-active);
    }

    &:hover {
      background-color: var(--bg-dark-active);
    }
  }

  .chat-icon {
    font-size: 24px;
    margin-right: 6px;
  }

  .chat-title {
    font-size: 14px;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .hide-btn {
    display: none;
  }
}

@include mobile {
  .chat-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: var(--z-index-fixed);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.show {
      transform: translateX(0);
    }
  }
}
</style>
