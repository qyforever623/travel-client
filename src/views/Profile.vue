<script setup>
import TopBar from '../components/TopBar.vue'
</script>

<template>
  <div class="page">
    <TopBar title="我的" />
    <div class="content">
      <p>我是 Profile.vue</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 20px;
  padding-top: 80px;
}
</style>