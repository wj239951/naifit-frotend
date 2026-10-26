// 与 FastAPI（api/schemas.py + core/ui_view.card_view）一一对应的前端类型。

export type Tier = 'safe' | 'highlight' | 'bold' | 'fill'

export interface StyleMedia {
  image?: string | null
  source_url?: string | null
  license?: string | null
  provider?: string | null
  relevance?: number | null
  fetched_at?: string | null
  verified?: boolean | null
  note?: string | null
  creator?: string | null
  license_detail?: string | null
}

export interface Style {
  id: string
  name: string
  image: string
  shape: string[]
  color_family: string
  tone: string
  value: string
  saturation: string
  style: string
  length_fit: string
  nail_bed_fit: string[]
  scene: string[]
  hue: number
  tags: string[]
  media?: StyleMedia | null
}

export interface Features {
  nail_bed_ratio: string
  nail_shape: string
  length: string
  ita_band: string
  warmth: string
  hand_type: string
  scene: string
  ita_degrees?: number | null
}

export interface Recommendation {
  style_id: string
  name: string
  image: string
  color_family: string
  style: string
  shape: string[]
  length_fit: string
  tier: Tier
  match_score: number
  matched_rules: string[]
  matched_reasons: string[]
  reason: string
  caution: string | null
  media: StyleMedia | null
}

export interface ExplainerMeta {
  mode?: string
  model?: string
  degraded?: boolean
  llm_cards?: number
  error?: string | null
}

export interface RecommendMeta {
  candidates_considered: number
  excluded: number
  engine: string
  explainer: ExplainerMeta
  [key: string]: unknown
}

export interface RecommendResponse {
  features: Features
  recommendations: Recommendation[]
  avoid: string[]
  meta: RecommendMeta
}

export type LibraryName = 'sample' | 'demo'

export interface RecommendPayload {
  features: Features
  free_text?: string
  use_llm?: boolean
  library?: LibraryName
}

export interface VisionFeatures {
  nail_bed_ratio?: string
  nail_shape?: string
  length?: string
  ita_band?: string
  warmth?: string
  hand_type?: string
  [key: string]: string | null | undefined
}

export interface VisionMeta {
  image?: string
  quality?: string
  handedness?: string
  handedness_score?: number
  gesture?: string
  gesture_score?: number
  confidences?: Record<string, number>
  unreliable?: string[]
  notes?: string[]
  ita_degrees?: number
  metrics?: Record<string, number>
  preview?: string | null
}

export interface VisionResponse extends VisionMeta {
  features: VisionFeatures
}

export interface StylesResponse {
  count: number
  styles: Style[]
}

export interface HealthResponse {
  status: string
  service?: string
}
