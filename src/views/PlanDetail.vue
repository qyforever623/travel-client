<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBar from '../components/TopBar.vue'
import { fetchTravelPlan } from '../api/travel'

const route = useRoute()
const router = useRouter()

const destination = computed(() => route.query.destination || '未填写')
const budget = computed(() => route.query.budget || '0')
const days = computed(() => route.query.days || '0')
const planLoading = ref(true)
const planRequestFailed = ref(false)
const planErrorMessage = ref('')
const planResult = ref(null)
const expandedDays = ref(new Set([1]))

const pageTitle = computed(() => `${destination.value}行程规划详情`)
const overviewCity = computed(() => planResult.value?.city || destination.value)

const loadPlan = async () => {
  try {
    planLoading.value = true
    planRequestFailed.value = false
    planErrorMessage.value = ''
    const result = await fetchTravelPlan({
      destination: destination.value,
      budget: budget.value,
      days: days.value
    })

    if (result?.data?.success !== true) {
      planResult.value = null
      planRequestFailed.value = true
      planErrorMessage.value =  '行程规划生成失败，请重试'
      return
    }

    planResult.value = result.data
  } catch (error) {
    console.error('旅游规划失败:', error)
    planResult.value = null
    planRequestFailed.value = true
    planErrorMessage.value = '旅游规划请求失败，请重试'
  } finally {
    planLoading.value = false
  }
}

onMounted(() => {
  loadPlan()
})

const toggleDay = (dayNumber) => {
  const nextExpandedDays = new Set(expandedDays.value)
  if (nextExpandedDays.has(dayNumber)) {
    nextExpandedDays.delete(dayNumber)
  } else {
    nextExpandedDays.add(dayNumber)
  }
  expandedDays.value = nextExpandedDays
}

const goBack = () => {
  router.back()
}

const goToChat = () => {
  router.push({ name: 'Chat' })
}
</script>

<template>
  <div class="page">
    <TopBar :title="pageTitle" :show-back="true" @back="goBack" />

    <main class="content">
      <div v-if="planLoading" class="loading">正在生成行程规划...</div>
      <template v-else-if="planResult">
        <section class="overview panel">
          <div class="overview-main">
            <h1>{{ overviewCity }} · {{ planResult.days }}天行程</h1>
          </div>
          <div class="overview-budget">
            <span>预算</span>
            <strong>¥{{ planResult.totalBudget }}</strong>
          </div>
        </section>

        <section class="itinerary-section">
          <div class="section-heading">
            <div>
              <h2>行程规划</h2>
            </div>
            <span class="day-count">{{ planResult.dailyItinerary?.length || 0 }} 天</span>
          </div>

          <article
            v-for="(day, index) in planResult.dailyItinerary || []"
            :key="day.day || index"
            class="day-panel"
          >
            <button
              class="day-toggle"
              type="button"
              :aria-expanded="expandedDays.has(day.day || index + 1)"
              @click="toggleDay(day.day || index + 1)"
            >
              <span class="day-number">{{ String(day.day || index + 1).padStart(2, '0') }}</span>
              <span class="day-title">{{ day.date || `第${day.day || index + 1}天` }}</span>
              <span class="day-route">{{ day.morning?.spot || '行程待安排' }}</span>
              <span class="chevron" :class="{ expanded: expandedDays.has(day.day || index + 1) }" aria-hidden="true"></span>
            </button>

            <div v-if="expandedDays.has(day.day || index + 1)" class="day-details">
              <section
                v-for="period in [
                  { key: 'morning', label: '上午' },
                  { key: 'afternoon', label: '下午' },
                  { key: 'evening', label: '晚上' }
                ]"
                :key="period.key"
                class="period"
              >
                <div class="period-body">
                  <div class="period-heading">
                    <div class="period-label" :class="period.key">{{ period.label }}</div>
                    <h3>{{ day[period.key]?.spot || '暂无安排' }}</h3>
                  </div>
                  <div class="meta-row">
                    <span class="meta-item"><span class="meta-icon clock-icon"></span>{{ day[period.key]?.duration || '时长待定' }}</span>
                    <span class="meta-item"><span class="meta-icon ticket-icon"></span>{{ day[period.key]?.ticket || '门票信息待定' }}</span>
                  </div>
                  <p class="transport"><span class="meta-icon transit-icon"></span>{{ day[period.key]?.transportation || '交通方式待定' }}</p>
                  <p class="description">{{ day[period.key]?.description || '暂无景点介绍' }}</p>
                </div>
              </section>
            </div>
          </article>
        </section>

        <section class="panel budget-panel">
          <div class="section-heading compact-heading">
            <div>
              <h2>预算明细</h2>
            </div>
          </div>
          <dl class="budget-list">
            <div><dt>住宿</dt><dd>{{ planResult.budgetBreakdown?.accommodation || '—' }}</dd></div>
            <div><dt>餐饮</dt><dd>{{ planResult.budgetBreakdown?.food || '—' }}</dd></div>
            <div><dt>交通</dt><dd>{{ planResult.budgetBreakdown?.transportation || '—' }}</dd></div>
            <div><dt>门票</dt><dd>{{ planResult.budgetBreakdown?.tickets || '—' }}</dd></div>
            <div><dt>其他</dt><dd>{{ planResult.budgetBreakdown?.other || '—' }}</dd></div>
          </dl>
          <div class="budget-total"><strong>总计</strong><strong>¥{{ planResult.totalBudget }}</strong></div>
        </section>

        <section class="panel notes-panel">
          <div class="section-heading compact-heading">
            <div>
              <h2>温馨提示</h2>
            </div>
          </div>
          <ul class="note-list">
            <li v-for="(tip, index) in planResult.tips || []" :key="`tip-${index}`">{{ tip }}</li>
          </ul>
        </section>

        <section class="panel notes-panel warning-panel">
          <div class="section-heading compact-heading">
            <div>
              <h2>注意事项</h2>
            </div>
          </div>
          <ul class="note-list">
            <li v-for="(warning, index) in planResult.warnings || []" :key="`warning-${index}`">{{ warning }}</li>
          </ul>
        </section>
      </template>
      <section v-else class="plan-placeholder panel">
        <p>{{ planErrorMessage || '暂时没有可用的行程规划' }}</p>
        <button v-if="planRequestFailed" type="button" class="retry-button" @click="loadPlan">
          重试
        </button>
      </section>
    </main>

    <footer class="chat-footer">
      <button type="button" class="chat-button" @click="goToChat">
        <van-icon name="chat-o" />
        <span>去聊天，继续完善行程</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f5f4;
  color: #252b28;
}

.content {
  display: grid;
  gap: 14px;
  padding: 14px 14px 104px;
  text-align: left;
}

.panel,
.day-panel {
  overflow: hidden;
  border: 1px solid rgba(31, 50, 42, 0.06);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(34, 48, 41, 0.045);
}

.overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.overview-main {
  min-width: 0;
}

.overview-main h1 {
  overflow: hidden;
  margin: 0;
  font-size: 18px;
  font-weight: 750;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-budget {
  display: grid;
  flex: 0 0 auto;
  gap: 4px;
  text-align: right;
}

.overview-budget span {
  color: #969d99;
  font-size: 12px;
}

.overview-budget strong,
.budget-total strong:last-child {
  color: #c6533f;
  font-size: 18px;
}

.itinerary-section {
  display: grid;
  gap: 10px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: 4px 2px 2px;
}

.section-heading h2 {
  margin: 0;
  font-size: 19px;
  line-height: 1.25;
}

.day-count {
  padding-bottom: 2px;
  color: #858e88;
  font-size: 12px;
}

.day-toggle {
  display: grid;
  width: 100%;
  min-height: 58px;
  grid-template-columns: 34px minmax(62px, auto) minmax(0, 1fr) 18px;
  align-items: center;
  gap: 8px;
  border: 0;
  background: #fff;
  padding: 10px 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.day-number {
  color: #bb674e;
  font-size: 11px;
  font-weight: 700;
}

.day-title {
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
}

.day-route {
  overflow: hidden;
  color: #929a95;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  width: 8px;
  height: 8px;
  justify-self: center;
  border-right: 1.5px solid #838c86;
  border-bottom: 1.5px solid #838c86;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 160ms ease;
}

.chevron.expanded {
  transform: rotate(225deg) translate(-2px, -1px);
}

.day-details {
  border-top: 1px solid #edf0ed;
  padding: 2px 14px 12px;
}

.period {
  padding: 14px 0;
}

.period + .period {
  border-top: 1px solid #f0f2f0;
}

.period-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.period-label {
  flex: 0 0 auto;
  width: max-content;
  height: 25px;
  border-radius: 4px;
  padding: 4px 7px;
  font-size: 12px;
  font-weight: 700;
}

.period-label.morning {
  background: #fff4dd;
  color: #b57b27;
}

.period-label.afternoon {
  background: #e8f4f5;
  color: #387e86;
}

.period-label.evening {
  background: #edf0ea;
  color: #627452;
}

.period-body h3 {
  min-width: 0;
  overflow: hidden;
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  text-overflow: ellipsis;
}

.period-body .meta-row {
  margin-top: 10px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 14px;
}

.meta-item,
.transport {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  color: #777f79;
  font-size: 12px;
  line-height: 1.55;
}

.meta-icon {
  position: relative;
  display: inline-block;
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  margin-top: 1px;
  color: #8a938d;
}

.clock-icon {
  border: 1.5px solid currentColor;
  border-radius: 50%;
}

.clock-icon::before {
  position: absolute;
  top: 2px;
  left: 5px;
  width: 1px;
  height: 4px;
  background: currentColor;
  content: '';
}

.clock-icon::after {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 3px;
  height: 1px;
  background: currentColor;
  content: '';
}

.ticket-icon {
  border: 1px solid currentColor;
  border-radius: 3px;
}

.ticket-icon::after {
  position: absolute;
  top: 1px;
  left: 6px;
  height: 10px;
  border-left: 1px dashed currentColor;
  content: '';
}

.transit-icon {
  border: 1.5px solid currentColor;
  border-radius: 4px 4px 2px 2px;
}

.transit-icon::before {
  position: absolute;
  right: 2px;
  bottom: 2px;
  left: 2px;
  border-top: 1px solid currentColor;
  content: '';
}

.transport {
  margin-top: 9px;
}

.description {
  margin: 10px 0 0;
  color: #929994;
  font-size: 12px;
  line-height: 1.7;
}

.budget-panel,
.notes-panel {
  padding: 16px;
}

.compact-heading {
  margin-bottom: 8px;
}

.budget-list {
  margin: 0;
}

.budget-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 2px;
}

.budget-list dt {
  flex: 0 0 42px;
  color: #555e58;
  font-size: 13px;
}

.budget-list dd {
  margin: 0;
  color: #8a928d;
  font-size: 12px;
  line-height: 1.5;
  text-align: right;
}

.budget-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 7px;
  border-radius: 8px;
  background: #f4f6f5;
  padding: 13px 12px;
}

.budget-total strong:first-child {
  font-size: 15px;
}

.note-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.note-list li {
  padding: 10px 0;
  color: #747d77;
  font-size: 13px;
  line-height: 1.65;
}

.note-list li + li {
  border-top: 1px solid #f0f2f0;
}

.loading,
.empty {
  padding: 28px 16px;
  color: #747d77;
  text-align: center;
}

.plan-placeholder {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding: 18px;
  text-align: left;
}

.plan-placeholder p {
  margin: 0;
  color: #747d77;
  font-size: 14px;
}

.retry-button {
  min-height: 36px;
  border: 0;
  border-radius: 6px;
  background: #397b62;
  padding: 0 16px;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.retry-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.chat-footer {
  position: fixed;
  z-index: 10;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8ece9;
  background: rgba(255, 255, 255, 0.96);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
}

.chat-button {
  display: flex;
  width: min(100%, 680px);
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  border: 0;
  border-radius: 8px;
  background: #397b62;
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 650;
  cursor: pointer;
}

.chat-button :deep(.van-icon) {
  font-size: 18px;
}

@media (min-width: 700px) {
  .content {
    width: min(720px, 100%);
    margin: 0 auto;
    padding-right: 20px;
    padding-left: 20px;
  }
}
</style>
