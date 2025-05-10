<template>
  <div class="language-switcher">
    <ElDropdown trigger="click" @command="changeLanguage">
      <SvgIcon path="language-icon.svg" :size="20" />
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem command="zh-CN" :class="{ 'is-active': locale === 'zh-CN' }"
            >中文</ElDropdownItem
          >
          <ElDropdownItem command="en" :class="{ 'is-active': locale === 'en' }"
            >English</ElDropdownItem
          >
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import SvgIcon from '@/components/SvgIcon.vue'

const { locale } = useI18n()
const changeLanguage = (lang: string) => {
  locale.value = lang
}
</script>

<style scoped>
.language-switcher {
  position: fixed;
  color: var(--text-dark-primary);
  top: 24px;
  right: 24px;
  z-index: var(--z-index-fixed);
  cursor: pointer;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: bold;
  background-color: var(--el-dropdown-menuItem-hover-fill);
}
</style>
