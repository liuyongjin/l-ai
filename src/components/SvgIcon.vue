<template>
  <el-icon :size="size ?? 20">
    <span v-if="svgContent" v-html="svgContent" />
    <img v-else :src="imagePath" alt="Icon" />
  </el-icon>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

const props = defineProps<{
  path: string
  size?: number
  color?: string
}>()

const assetBasePath = '/src/assets/icons/'

const imagePath = computed(() => {
  return new URL(`${assetBasePath}${props.path}`, import.meta.url).href
})

const svgContent = ref<string>('')

watchEffect(async () => {
  if (!props.path) return
  const res = await fetch(imagePath.value)
  let text = await res.text()
  if (props.color) {
    // Replace the fill property with a regular expression (only replace the primary color, assuming the primary color is the first fill)
    text = text.replace(/fill=["']#[0-9a-fA-F]{3,6}["']/, `fill=\"${props.color}\"`)
  }
  svgContent.value = text
})
</script>
