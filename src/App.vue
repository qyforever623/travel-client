<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const active = ref(0)
const route = useRoute()
const showTabbar = computed(() => route.name !== 'PlanDetail')
</script>

<template>
  <div class="app">
    <div
      class="page-content"
      :class="{
        'page-content-with-tabbar': showTabbar && route.name !== 'Chat',
        'page-content-chat': route.name === 'Chat'
      }"
    >
      <router-view />
    </div>

    <van-tabbar v-if="showTabbar" v-model="active" route fixed>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/chat" icon="chat-o">对话</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-content {
  padding-bottom: 0;
}

.page-content-with-tabbar {
  padding-bottom: 70px;
}

.page-content-chat {
  padding-bottom: 0;
}
</style>
