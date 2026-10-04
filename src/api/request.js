import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const request = axios.create({
  baseURL: API_BASE,
  timeout: 60000
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || '请求失败'

    const normalizedError = new Error(message)
    normalizedError.name = error?.name || 'RequestError'
    normalizedError.code = error?.code || error?.response?.status || 'UNKNOWN'
    normalizedError.status = error?.response?.status
    normalizedError.response = error?.response
    normalizedError.originalError = error

    return Promise.reject(normalizedError)
  }
)

export default request
