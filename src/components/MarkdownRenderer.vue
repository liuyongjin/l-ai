<template>
  <div class="markdown-renderer" :class="{ 'has-code-blocks': hasCodeBlocks }">
    <div v-html="renderedMarkdown"></div>
    <el-tooltip v-if="hasCodeBlocks" content="复制代码" placement="top">
      <el-icon class="copy-btn" @click="copyAllCode">
        <CopyDocument />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { ElNotification } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import hljs from 'highlight.js'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

const md: MarkdownIt = new MarkdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (error) {
        console.error(`Highlight.js error: ${error}`)
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

const renderedMarkdown = computed(() => {
  if (!props.content) return ''
  return md.render(props.content)
})

const hasCodeBlocks = computed(() => {
  return props.content.includes('```')
})

const copyAllCode = () => {
  const codeBlocks = document.querySelectorAll('.hljs code')
  let allCode = ''

  codeBlocks.forEach((block, index) => {
    if (index > 0) allCode += '\n\n'
    allCode += block.textContent
  })

  navigator.clipboard.writeText(allCode).then(() => {
    ElNotification({
      title: '成功',
      message: '代码已复制到剪贴板',
      type: 'success',
      duration: 2000,
    })
  })
}
</script>

<style scoped lang="scss">
.markdown-renderer {
  position: relative;
  padding: 8px 16px;
  background: var(--bg-dark-active);
  border-radius: var(--border-radius-md);
  div {
    word-break: break-all;
  }
  p {
    word-break: break-all;
  }
}

.has-code-blocks {
  padding-top: 32px;
}

.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0;
  border: none;
  font-size: 16px;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

:deep(.hljs) {
  position: relative;
  margin: 8px 0;
  padding: 12px;
  background-color: var(--bg-dark);
  color: var(--text-dark-primary);
  border-radius: var(--border-radius-md);
}
</style>
