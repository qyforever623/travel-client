<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '../components/TopBar.vue'
import { streamTravelChat } from '../api/chat'

const router = useRouter()
const draft = ref('')
const messages = ref([])
const sending = ref(false)
const chatContent = ref(null)
let activeRequest = null

const commonQuestions = [
  '北京有哪些必去的景点？',
  '推荐一些上海美食',
  '成都三日游攻略',
  '如何选择旅行保险？'
]
const hasDraft = computed(() => Boolean(draft.value.trim()))

const getMessageTime = () => new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
}).format(new Date())

const goBack = () => {
  router.back()
}

const chooseQuestion = (question) => {
  draft.value = question
}

const isNearBottom = () => {
  const container = chatContent.value
  return container
    ? container.scrollHeight - container.scrollTop - container.clientHeight <= 80
    : true
}

const scrollToLatest = async (shouldFollow = false) => {
  await nextTick()
  const container = chatContent.value
  if (container && (shouldFollow || isNearBottom())) {
    container.scrollTop = container.scrollHeight
  }
}

const sendMessage = async () => {
  const message = draft.value.trim()
  if (!message || sending.value) return

  const history = messages.value
    .filter((item) => item.content && item.status !== 'failed')
    .map(({ role, content }) => ({ role, content }))

  messages.value.push(
    { role: 'user', content: message, time: getMessageTime(), status: 'pending' },
    { role: 'assistant', content: '', error: '', time: getMessageTime(), status: 'streaming' }
  )
  draft.value = ''
  sending.value = true
  activeRequest = new AbortController()
  await scrollToLatest(true)

  const assistantMessage = messages.value[messages.value.length - 1]

  try {
    const result = await streamTravelChat({
      message,
      history,
      signal: activeRequest.signal,
      onChunk: (chunk) => {
        if (typeof chunk === 'string') {
          const shouldFollow = isNearBottom()
          assistantMessage.content += chunk
          scrollToLatest(shouldFollow)
        }
      }
    })

    if (result?.success === false) {
      assistantMessage.content = ''
      assistantMessage.status = 'failed'
      assistantMessage.error = result.content || '本次回复未能正常生成，请重试。'
      messages.value[messages.value.length - 2].status = 'failed'
    } else {
      assistantMessage.status = 'complete'
      messages.value[messages.value.length - 2].status = 'complete'
    }
  } catch (error) {
    if (!activeRequest.signal.aborted) {
      assistantMessage.status = 'failed'
      assistantMessage.error = error?.message || '回复连接中断，请重试。'
      messages.value[messages.value.length - 2].status = 'failed'
    }
  } finally {
    sending.value = false
    activeRequest = null
    scrollToLatest()
  }
}

onBeforeUnmount(() => {
  activeRequest?.abort()
})
</script>

<template>
  <div class="page">
    <TopBar title="AI 旅游助手" :show-back="true" @back="goBack" />

    <main ref="chatContent" class="chat-content" :class="{ 'has-messages': messages.length }">
      <div v-if="!messages.length" class="welcome-state">
        <van-empty image="search" description="开始和 AI 助手对话吧！" />

        <section class="question-section" aria-labelledby="common-questions-title">
          <h2 id="common-questions-title">常见问题</h2>
          <div class="question-list">
            <van-button
              v-for="question in commonQuestions"
              :key="question"
              size="small"
              plain
              class="question-button"
              :disabled="sending"
              @click="chooseQuestion(question)"
            >
              {{ question }}
            </van-button>
          </div>
        </section>
      </div>

      <div v-else class="message-list" aria-live="polite">
        <article
          v-for="(message, index) in messages"
          :key="index"
          class="message-row"
          :class="message.role"
        >
          <div class="message-bubble">
            <span v-if="message.content">{{ message.content }}</span>
            <span v-else-if="sending" class="typing-indicator">正在思考...</span>
          </div>
          <p v-if="message.error" class="message-error">{{ message.error }}</p>
          <time class="message-time">{{ message.time }}</time>
        </article>
      </div>
    </main>

    <form class="composer" @submit.prevent="sendMessage">
      <van-field
        v-model="draft"
        class="message-field"
        type="textarea"
        rows="1"
        autosize
        maxlength="1000"
        placeholder="输入您的问题..."
        aria-label="输入消息"
      >
        <template #button>
          <van-button
            type="primary"
            size="small"
            native-type="submit"
            :disabled="!hasDraft || sending"
            :loading="sending"
          >
            发送
          </van-button>
        </template>
      </van-field>
    </form>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  height: 100dvh;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: #f4f5f4;
}

.chat-content {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  padding: 12px 18px 120px;
  overscroll-behavior: contain;
}

.chat-content.has-messages {
  justify-content: flex-start;
}

.welcome-state {
  width: min(100%, 480px);
  align-self: center;
  transform: translateY(-3vh);
}

.welcome-state :deep(.van-empty) {
  padding: 12px 0 18px;
}

.welcome-state :deep(.van-empty__image) {
  width: 112px;
  height: 112px;
}

.welcome-state :deep(.van-empty__description) {
  margin-top: 12px;
  color: #858c87;
  font-size: 15px;
}

.question-section h2 {
  margin: 4px 0 16px;
  color: #525b55;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.question-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 8px;
}

.question-button {
  max-width: 100%;
  height: auto;
  min-height: 34px;
  border-color: #dfe5e1;
  border-radius: 18px;
  background: #fff;
  padding: 6px 12px;
  color: #59635d;
  white-space: normal;
}

.composer {
  position: fixed;
  right: 0;
  bottom: calc(var(--van-tabbar-height, 50px) + env(safe-area-inset-bottom));
  left: 0;
  z-index: 10;
  border-top: 1px solid #e9ecea;
  background: rgba(255, 255, 255, 0.97);
  padding: 10px 14px 12px;
}

.message-field {
  align-items: center;
  border: 1px solid #edf0ee;
  border-radius: 14px;
  background: #f7f8f7;
  padding: 7px 8px 7px 14px;
}

.message-field :deep(.van-field__control) {
  max-height: 112px;
  color: #303833;
  font-size: 14px;
  line-height: 1.5;
}

.message-field :deep(.van-field__button) {
  padding-left: 10px;
}

.message-list {
  display: grid;
  width: min(100%, 680px);
  gap: 14px;
  align-self: center;
  margin: 0 auto;
}

.message-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.message-row.user {
  align-items: flex-end;
}

.message-row.assistant {
  align-items: flex-start;
}

.message-bubble {
  max-width: min(82%, 520px);
  border-radius: 14px;
  padding: 11px 14px;
  font-size: 14px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  text-align: left;
  white-space: pre-wrap;
}

.message-row.user .message-bubble {
  border-bottom-right-radius: 4px;
  background: #397b62;
  color: #fff;
}

.message-row.assistant .message-bubble {
  border: 1px solid #e8ece9;
  border-bottom-left-radius: 4px;
  background: #fff;
  color: #303833;
}

.typing-indicator {
  color: #89918c;
}

.message-time {
  margin-top: 4px;
  color: #9aa19c;
  font-size: 10px;
  line-height: 1.3;
}

.message-error {
  margin: 5px 0 0;
  color: #b94b3d;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
}

@media (max-height: 650px) {
  .chat-content {
    justify-content: flex-start;
  }

  .welcome-state {
    transform: none;
  }
}
</style>