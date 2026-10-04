<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  backText: {
    type: String,
    default: '返回'
  }
})

const emit = defineEmits(['back'])
</script>

<template>
  <van-nav-bar
    :title="props.title"
    fixed
    placeholder
    :left-arrow="props.showBack"
    :left-text="props.showBack ? props.backText : undefined"
    @click-left="emit('back')"
  />
</template>
