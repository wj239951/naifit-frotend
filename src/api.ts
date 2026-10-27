import type {
  HealthResponse,
  LibrariesResponse,
  LibraryName,
  RecommendPayload,
  RecommendResponse,
  StylesResponse,
  VisionResponse,
} from './types'

// 开发环境留空：Vite 代理 /api、/static → 127.0.0.1:8000
// 部署环境在 .env 里设置 VITE_API_BASE=https://api.example.com
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE}${path}`
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(withBase(path), { ...init, signal: controller.signal })
    if (!res.ok) {
      let detail = `请求失败（HTTP ${res.status}）`
      try {
        const body = await res.json()
        if (typeof body?.detail === 'string') detail = body.detail
        else if (body?.detail) detail = JSON.stringify(body.detail)
      } catch {
        /* 非 JSON 错误体，保留默认文案 */
      }
      throw new ApiError(res.status, detail)
    }
    return (await res.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if ((err as Error)?.name === 'AbortError') {
      throw new ApiError(0, '请求超时：后端可能没启动，或正在冷启动')
    }
    throw new ApiError(0, `无法连接后端：${(err as Error)?.message ?? '网络错误'}`)
  } finally {
    window.clearTimeout(timer)
  }
}

export const api = {
  health: () => request<HealthResponse>('/api/health', {}, 6000),
  libraries: () => request<LibrariesResponse>('/api/libraries', {}, 8000),
  styles: (library: LibraryName = 'sample') =>
    request<StylesResponse>(`/api/styles?library=${encodeURIComponent(library)}`, {}, 15000),
  recommend: (payload: RecommendPayload) =>
    request<RecommendResponse>(
      '/api/recommend',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      60000,
    ),
  visionUpload: (file: File, scene: string) =>
    request<VisionResponse>(
      `/api/vision/upload?scene=${encodeURIComponent(scene)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      },
      120000,
    ),
}

/** 把后端返回的相对图片路径（static/styles/s001.jpg）转成浏览器可加载的 URL。 */
export function assetUrl(path?: string | null): string {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return withBase(`/${path.replace(/^\/+/, '')}`)
}

/** 下载任意 JSON 结果。 */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
