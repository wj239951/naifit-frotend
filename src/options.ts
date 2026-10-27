import type { Features, LibrariesResponse, LibraryName } from './types'

export interface Option {
  value: string
  label: string
}

export interface FieldDef {
  key: keyof Features
  label: string
  hint?: string
  options: Option[]
}

// 与 data/taxonomy.yaml 的 features 枚举保持一致
export const FIELDS: FieldDef[] = [
  {
    key: 'nail_bed_ratio',
    label: '甲床比例',
    options: [
      { value: 'short_wide', label: '短宽' },
      { value: 'standard', label: '标准' },
      { value: 'slender', label: '细长' },
    ],
  },
  {
    key: 'nail_shape',
    label: '当前甲型',
    options: [
      { value: 'round', label: '圆形' },
      { value: 'square', label: '方形' },
      { value: 'oval', label: '椭圆' },
      { value: 'almond', label: '杏仁' },
      { value: 'squoval', label: '方圆' },
    ],
  },
  {
    key: 'length',
    label: '甲长',
    options: [
      { value: 'very_short', label: '超短' },
      { value: 'short', label: '短甲' },
      { value: 'mid', label: '中长' },
      { value: 'long', label: '长甲' },
    ],
  },
  {
    key: 'ita_band',
    label: '肤色深浅',
    options: [
      { value: 'light', label: '偏浅' },
      { value: 'mid', label: '中等' },
      { value: 'deep', label: '偏深' },
    ],
  },
  {
    key: 'warmth',
    label: '肤色冷暖',
    options: [
      { value: 'cool', label: '冷调' },
      { value: 'neutral', label: '中性' },
      { value: 'warm', label: '暖调' },
    ],
  },
  {
    key: 'hand_type',
    label: '手型',
    options: [
      { value: 'slim', label: '纤细' },
      { value: 'standard', label: '标准' },
      { value: 'fleshy', label: '肉感' },
    ],
  },
  {
    key: 'scene',
    label: '使用场景',
    options: [
      { value: 'commute', label: '通勤' },
      { value: 'date', label: '约会' },
      { value: 'wedding', label: '婚礼' },
      { value: 'festival', label: '节日' },
      { value: 'cool', label: '个性' },
      { value: 'y2k', label: 'Y2K' },
    ],
  },
]

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  FIELDS.map((f) => [String(f.key), f.label]),
)

export const SCENE_LABELS: Record<string, string> = {
  commute: '通勤',
  date: '约会',
  wedding: '婚礼',
  festival: '节日',
  cool: '个性',
  y2k: 'Y2K',
}

export const LIBRARIES: Option[] = [
  { value: 'sample', label: '样例库 · 15 款（示意图）' },
  { value: 'demo', label: '演示库 · 43 款（真实截图）' },
]

export const LIBRARY_HINTS: Record<string, string> = {
  sample: '精绘占位示意图，非真实款式；随仓库提交，离线也能看',
  demo: '公开平台真实截图，仅演示用，版权归原作者',
}

export const LIBRARY_SHORT: Record<string, string> = {
  sample: '样例库',
  demo: '演示库',
}

/** 有图齐全的演示库优先（真实截图更好看）；否则退回样例库。 */
export function pickDefaultLibrary(res: LibrariesResponse | null): LibraryName | null {
  if (!res) return null
  const ready = res.libraries.filter((item) => item.available && item.images_ready)
  const demo = ready.find((item) => item.name === 'demo')
  if (demo) return 'demo'
  const sample = ready.find((item) => item.name === 'sample')
  return sample ? 'sample' : null
}

export const TIER_LABELS: Record<string, string> = {
  safe: '稳妥款',
  highlight: '亮点款',
  bold: '大胆款',
  fill: '补充款',
}

export const TIER_HINTS: Record<string, string> = {
  safe: '通勤/日常不挑环境，最稳',
  highlight: '约会/婚礼场景加分项',
  bold: '节日与个性场景的表达',
  fill: '候选不足时的补充推荐',
}

export const COLOR_FAMILY_LABELS: Record<string, string> = {
  nude_pink: '裸粉',
  true_red: '正红',
  berry: '浆果',
  orange_brown: '橘棕',
  blue_green: '蓝绿',
  mono: '黑白',
  metal: '金属',
  glitter: '闪片',
}

export const STYLE_LABELS: Record<string, string> = {  solid: '纯色',
  french: '法式',
  gradient: '渐变',
  cat_eye: '猫眼',
  chrome: '镜面',
  drawing: '手绘',
  rhinestone: '贴钻',
  checker: '格纹',
  marble: '大理石',
  mixed: '混合',
  glitter: '闪片',
}

export const LENGTH_FIT_LABELS: Record<string, string> = {
  short: '适合短甲',
  mid: '适合中长甲',
  long: '适合长甲',
}

export const QUALITY_LABELS: Record<string, string> = {
  ok: '识别良好',
  relaxed: '手略扣 · 仅出肤色',
  clenched: '握拳/展示角度 · 仅出肤色',
  pose: '透视偏重 · 需手动补全',
  low: '手部太小/置信度低',
}

export const LICENSE_LABELS: Record<string, string> = {
  demo: '演示素材',
  self: '自有授权',
  pexels: 'Pexels 可商用',
  unsplash: 'Unsplash 可商用',
  openverse: 'CC 开放许可',
  unknown: '授权待确认',
  placeholder: '示意占位图',
}

// 常用规则 id → 中文（没命中的走 humanize 兜底）
export const RULE_LABELS: Record<string, string> = {
  bed_short_wide: '短宽甲床 → 拉长视觉',
  bed_slender: '细长甲床 → 可驾驭多种甲型',
  bed_standard: '标准甲床 → 适配面广',
  length_short: '短甲优先短甲友好款',
  length_long: '长甲可做复杂款式',
  skin_light_warm: '暖调浅肤 → 奶茶/橘棕',
  skin_light_cool: '冷调浅肤 → 裸粉/冷调',
  skin_mid_warm: '暖调中等肤色 → 正红/橘棕',
  skin_deep: '深肤色 → 高对比色',
  hand_slim: '纤细手型适配修长甲型',
  hand_fleshy: '肉感手型 → 方圆/中深色收窄',
  hand_standard: '标准手型适配面广',
  scene_commute: '通勤 → 低饱和纯色/法式',
  scene_wedding: '婚礼 → 温柔法式/裸粉',
  scene_date: '约会 → 透亮渐变/猫眼',
  scene_festival: '节日 → 浓郁手绘/闪片',
  scene_cool: '个性场景 → 金属/黑白',
  scene_y2k: 'Y2K → 镜面/格纹',
}

export function humanizeRule(rule: string): string {
  return RULE_LABELS[rule] ?? rule.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export interface Preset {
  id: string
  name: string
  desc: string
  features: Features
}

export const PRESETS: Preset[] = [
  {
    id: 'short-warm',
    name: '短宽暖皮 · 通勤',
    desc: '短甲 + 暖调浅肤，最常见日常手型',
    features: {
      nail_bed_ratio: 'short_wide',
      nail_shape: 'squoval',
      length: 'short',
      ita_band: 'light',
      warmth: 'warm',
      hand_type: 'fleshy',
      scene: 'commute',
    },
  },
  {
    id: 'slender-cool',
    name: '细长冷皮 · 约会',
    desc: '细长甲床、冷调肤色，约会场景',
    features: {
      nail_bed_ratio: 'slender',
      nail_shape: 'oval',
      length: 'mid',
      ita_band: 'mid',
      warmth: 'cool',
      hand_type: 'slim',
      scene: 'date',
    },
  },
  {
    id: 'deep-festival',
    name: '深肤浓郁 · 节日',
    desc: '深肤色适合高对比浓郁款',
    features: {
      nail_bed_ratio: 'standard',
      nail_shape: 'almond',
      length: 'mid',
      ita_band: 'deep',
      warmth: 'warm',
      hand_type: 'standard',
      scene: 'festival',
    },
  },
  {
    id: 'long-y2k',
    name: '长甲 · Y2K',
    desc: '长甲做镜面、格纹、金属这类强表达',
    features: {
      nail_bed_ratio: 'standard',
      nail_shape: 'square',
      length: 'long',
      ita_band: 'light',
      warmth: 'neutral',
      hand_type: 'slim',
      scene: 'y2k',
    },
  },
]

export const DEFAULT_FEATURES: Features = {
  nail_bed_ratio: 'short_wide',
  nail_shape: 'squoval',
  length: 'short',
  ita_band: 'light',
  warmth: 'warm',
  hand_type: 'fleshy',
  scene: 'commute',
}

export const FEATURE_KEYS: (keyof Features)[] = FIELDS.map((f) => f.key)
