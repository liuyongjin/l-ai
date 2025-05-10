<template>
  <div class="chat-main">
    <div class="chat-header">
      <el-icon class="menu-btn" @click="toggleSidebar">
        <Menu />
      </el-icon>
      <h2>{{ activeChat?.title || $t('chat.newChat') }}</h2>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="!activeChatMessages.length" class="empty-state">
        <div class="feature-cards">
          <div
            class="feature-card"
            @click="
              handleFeatureClick(
                $t('chat.features.parseDocument'),
                $t('chat.features.economicDevelopment'),
              )
            "
          >
            <h3>{{ $t('chat.features.parseDocument') }}</h3>
            <p>{{ $t('chat.features.economicDevelopment') }}</p>
          </div>
          <div
            class="feature-card"
            @click="
              handleFeatureClick(
                $t('chat.features.translateToEnglish'),
                $t('chat.features.longTimeNoSee'),
              )
            "
          >
            <h3>{{ $t('chat.features.translateToEnglish') }}</h3>
            <p>{{ $t('chat.features.longTimeNoSee') }}</p>
          </div>
          <div
            class="feature-card"
            @click="
              handleFeatureClick(
                $t('chat.features.sampleQuestion'),
                $t('chat.features.liuBeiShoes'),
              )
            "
          >
            <h3>{{ $t('chat.features.sampleQuestion') }}</h3>
            <p>{{ $t('chat.features.liuBeiShoes') }}</p>
          </div>
        </div>
      </div>
      <div
        v-else
        v-for="message in activeChatMessages"
        :key="message.id"
        class="message animate__animated animate__fadeIn"
        :class="{ user: message.role === 'user', ai: message.role === 'assistant' }"
      >
        <div class="message-avatar">
          <SvgIcon
            v-if="message.role === 'user'"
            path="user-avatar.svg"
            :size="40"
            :color="PRIMARY_COLOR"
          />
          <SvgIcon v-else path="ai-gpt-avatar.svg" :size="40" :color="PRIMARY_COLOR" />
        </div>
        <div class="message-content">
          <MarkdownRenderer
            :content="isLoading && !message.content ? $t('chat.thinking') : message.content"
          />
        </div>
      </div>
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        @keydown.enter.prevent="sendMessage"
        :placeholder="$t('chat.inputPlaceholder')"
        type="textarea"
        resize="none"
        :rows="5"
      ></el-input>
      <div class="input-actions">
        <el-button @click="sendMessage" class="send-btn" type="primary" :loading="isLoading">
          {{ $t('chat.send') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import { useI18n } from 'vue-i18n'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { computed, ref, defineExpose } from 'vue'
import { PRIMARY_COLOR } from '@/constants'
import { AiService } from '@/services'

const { activeChatId, scrollToBottom } = defineProps({
  toggleSidebar: {
    type: Function,
    required: true,
  },
  activeChatId: {
    type: String,
    required: true,
  },
  scrollToBottom: {
    type: Function,
    required: true,
  },
})

const { t } = useI18n()
const chatStore = useChatStore()
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)

const activeChat = computed(() => chatStore.activeChat)
const activeChatMessages = computed(() => chatStore.getMessagesByChatId())

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) {
    return
  }

  const message = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true

  await chatStore.addMessage({
    chatId: activeChatId,
    role: 'user',
    content: message,
    createdAt: new Date(Date.now()).toISOString(),
    error: false,
  })

  const tempMessageId = await chatStore.addMessage({
    chatId: activeChatId,
    role: 'assistant',
    content: '',
    error: false,
    createdAt: new Date(Date.now()).toISOString(),
  })

  scrollToBottom()

  try {
    let currentContent = ''
    await AiService.generateResponse(message, chatStore.activeChat?.messages || [], (chunk) => {
      currentContent += chunk
      chatStore.updateMessage({
        id: tempMessageId,
        chatId: activeChatId,
        role: 'assistant',
        content: currentContent,
        createdAt: new Date(Date.now()).toISOString(),
      })
      scrollToBottom()
    })
  } catch (error) {
    console.error(error)
    chatStore.updateMessage({
      id: tempMessageId,
      chatId: activeChatId,
      role: 'assistant',
      createdAt: new Date(Date.now()).toISOString(),
      error: true,
      content: t('chat.sendFailed'),
    })
  } finally {
    isLoading.value = false
  }
}

const handleFeatureClick = (title: string, desc: string) => {
  inputMessage.value = `${title}: ${desc}`
  sendMessage()
}

defineExpose({ messagesContainer })
</script>

<style scoped lang="scss">
@use '../assets/styles/mixins.scss' as *;

.chat-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;

  .chat-header {
    position: relative;
    height: 60px;
    padding: 20px 48px 16px 32px;
    border-bottom: 1px solid var(--border-dark);

    h2 {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      transform: translate(-50%, -50%);
    }
  }

  .menu-btn {
    position: absolute;
    left: 32px;
    display: none;
    margin-right: 16px;
    font-size: 20px;
    cursor: pointer;
    color: var(--primary-color);

    @include mobile {
      display: block;
    }
  }

  .chat-messages {
    flex: 1;
    padding: 32px 40px 16px 40px;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 24px;
    padding: 0 16px;
  }

  .feature-card {
    padding: 16px;
    border-radius: 8px;
    text-align: center;

    h3 {
      margin: 0 0 10px;
      font-size: 17px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .message {
    display: flex;
    gap: 18px;
    max-width: 80%;
    margin-bottom: 28px;

    &.user {
      margin-left: auto;
      flex-direction: row-reverse;
      .message-content {
        background-color: var(--primary-color);
      }
    }
  }

  .message-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .message-content {
    position: relative;
    min-height: 24px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    background-color: var(--border-dark);
  }

  .chat-input {
    padding: 20px 32px;
    border-top: 1px solid var(--border-dark);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);

    :deep(.el-textarea__inner) {
      background-color: var(--bg-dark);
    }

    :deep(.el-textarea__inner) {
      color: var(--text-dark-primary);
    }

    textarea {
      width: 100%;
      margin-bottom: 16px;
      padding: 14px 16px;
      border: 1px solid var(--border-dark);
      font-size: 16px;

      &:focus {
        outline: none;
      }
    }

    @include mobile {
      padding: 16px;
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
  }

  .send-btn {
    width: 70px;
    margin-top: 8px;

    @include mobile {
      width: 100%;
    }
  }
}
</style>
