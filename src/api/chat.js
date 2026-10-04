const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function streamTravelChat({ message, history = [], signal, onChunk }) {
  const response = await fetch(`${API_BASE}/travel/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, history }),
    signal
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `聊天请求失败（${response.status}）`)
  }

  if (!response.body) {
    throw new Error('当前环境不支持读取流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result = null

  const processFrame = (frame) => {
    const data = frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n')

    if (!data) return

    let event
    try {
      event = JSON.parse(data)
    } catch {
      throw new Error('聊天服务返回了无效数据')
    }

    if (event.event === 'chunk') {
      onChunk?.(event.payload)
    } else if (event.event === 'done') {
      result = event.payload
    } else if (event.event === 'error') {
      throw new Error(typeof event.payload === 'string' ? event.payload : '聊天服务发生错误')
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() || ''
      frames.forEach(processFrame)

      if (done) break
    }

    if (buffer.trim()) processFrame(buffer)
    return result
  } finally {
    reader.releaseLock()
  }
}