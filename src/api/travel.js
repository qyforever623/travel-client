import request from './request'

export async function fetchTravelPlan({ destination, budget, days }) {
  const payload = {
    destination: String(destination || '').trim(),
    budget: Number(budget),
    days: Number(days)
  }

  if (!payload.destination || !Number.isFinite(payload.budget) || payload.budget <= 0 || !Number.isFinite(payload.days) || payload.days <= 0) {
    throw new Error('参数不合法，destination、budget、days 必须有效')
  }

  const response = await request.post('/travel/plan', payload)
  return response.data
}
