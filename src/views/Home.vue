<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { areaList } from '@vant/area-data'
import { showToast } from 'vant'
import TopBar from '../components/TopBar.vue'

const router = useRouter()

const form = reactive({
  destination: '',
  budget: null,
  days: null
})

const showCityPicker = ref(false)
const cityAreaList = areaList

const hotCities = ref([
  { name: '三亚', active: false },
  { name: '杭州', active: false },
  { name: '巴厘岛', active: false },
  { name: '成都', active: false },
  { name: '北京', active: false },
  { name: '上海', active: false },
  { name: '大理', active: false },
  { name: '丽江', active: false }
])

const onSubmit = () => {
  const destination = String(form.destination || '').trim()
  const budget = Number(form.budget)
  const days = Number(form.days)

  if (!destination) {
    showToast('请选择目的地')
    return
  }

  if (!Number.isFinite(budget) || budget <= 0) {
    showToast('请输入正确的预算金额')
    return
  }

  if (!Number.isFinite(days) || days <= 0) {
    showToast('请输入正确的出行天数')
    return
  }

  router.push({
    name: 'PlanDetail',
    query: {
      destination,
      budget: String(budget),
      days: String(days)
    }
  })
}

const goToChat = () => {
  router.push('/chat')
}

const goToProfile = () => {
  router.push('/profile')
}

const selectHotCity = (city) => {
  hotCities.value.forEach((item) => {
    item.active = item.name === city.name
  })
  form.destination = city.name
}

const onCityConfirm = (values) => {
  const selectedOptions = values?.selectedOptions || values || []
  const city = selectedOptions[1]?.text || selectedOptions[1]?.name || ''

  form.destination = city
  showCityPicker.value = false
}
</script>

<template>
  <div class="page">
    <TopBar title="首页" />

    <div class="content">
      <van-notice-bar
        left-icon="volume-o"
        text="基于 AI 的智能方案介绍与行程规划系统"
      />

      <section class="panel plan-panel">
        <div class="section-header">
          <h3>规划旅程</h3>
        </div>

        <van-form @submit="onSubmit">
          <van-cell-group inset class="travel-form">
            <van-field
              v-model="form.destination"
              label="目的地"
              placeholder="请选择目的地"
              readonly
              clickable
              right-icon="arrow"
              @click="showCityPicker = true"
            />
            <van-field
              v-model="form.budget"
              label="预算"
              type="number"
              placeholder="请输入预算（元）"
            />
            <van-field
              v-model="form.days"
              label="天数"
              type="digit"
              placeholder="请输入出行天数"
            />
          </van-cell-group>

          <van-button class="submit-btn" type="primary" block round native-type="submit">
            开始规划
          </van-button>
        </van-form>

        <van-popup v-model:show="showCityPicker" position="bottom" round>
          <van-area
            :area-list="cityAreaList"
            title="选择目的地"
            :columns-num="2"
            @confirm="onCityConfirm"
            @cancel="showCityPicker = false"
          />
        </van-popup>
      </section>

      <section class="panel entry-panel">
        <div class="section-header">
          <h3>快捷入口</h3>
        </div>

        <van-grid :column-num="2" :gutter="12" class="entry-grid">
          <van-grid-item icon="chat-o" text="对话" @click="goToChat" />
          <van-grid-item icon="user-o" text="我的" @click="goToProfile" />
        </van-grid>
      </section>

      <section class="panel destination-panel">
        <div class="section-header destination-header">
          <h3>热门目的地</h3>
        </div>

        <div class="destination-list compact">
          <div
            v-for="city in hotCities"
            :key="city.name"
            class="destination-item compact-item"
            :class="{ active: city.active }"
            @click="selectHotCity(city)"
          >
            {{ city.name }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fb;
}

.content {
  padding: 12px 16px 80px;
}

.panel {
  margin-top: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(24, 33, 65, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.destination-header {
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2430;
}

.section-header span {
  font-size: 12px;
  color: #969799;
}

.travel-form {
  margin-bottom: 16px;
}

:deep(.van-cell-group) {
  border-radius: 14px;
  overflow: hidden;
}

.submit-btn {
  height: 44px;
  font-size: 15px;
}

.entry-grid {
  margin-top: 4px;
}

:deep(.van-grid-item__content) {
  background: #f7f9fc;
  border-radius: 12px;
  padding: 14px 8px;
}

.destination-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.destination-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 8px;
  border-radius: 12px;
  background: #f8f9fb;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #2a2d35;
  font-weight: 500;
}

.destination-item.active {
  background: linear-gradient(135deg, #4b8ef7, #2f6ae5);
  border-color: #2f6ae5;
  color: #fff;
  box-shadow: 0 6px 14px rgba(47, 106, 229, 0.22);
}
</style>