<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Features, LibraryName, RecommendResponse, Style, VisionResponse } from '../types'
import { api, ApiError } from '../api'
import { DEFAULT_FEATURES, LIBRARY_SHORT, SCENE_LABELS, type Preset } from '../options'
import FeatureForm from '../components/FeatureForm.vue'
import PhotoUpload from '../components/PhotoUpload.vue'
import ResultBoard from '../components/ResultBoard.vue'
import StyleGallery from '../components/StyleGallery.vue'

const features = ref<Features>({ ...DEFAULT_FEATURES })
const freeText = ref('')
const useLlm = ref(false)
const library = ref<LibraryName>('sample')
const loading = ref(false)
const result = ref<RecommendResponse | null>(null)
const error = ref('')

const styles = ref<Style[]>([])
const stylesError = ref('')
const llmReady = ref(false)
const showUpload = ref(false)

const libraryCount = computed(() => styles.value.length)
const libraryLabel = computed(() => LIBRARY_SHORT[library.value] ?? '款式库')

async function loadStyles(): Promise<void> {
  stylesError.value = ''
  try {
    const res = await api.styles(library.value)
    styles.value = res.styles
  } catch (err) {
    styles.value = []
    stylesError.value = err instanceof ApiError ? err.detail : '款式库加载失败'
  }
}

onMounted(async () => {
  await loadStyles()
  // 后端未配置 Key 时会自动退回模板理由，因此默认允许勾选；
  // 首次推荐成功后，可用 meta.explainer 进一步展示实际生成方式。
  llmReady.value = true
})

watch(library, () => {
  result.value = null
  void loadStyles()
})

function currentScene(): string {
  return features.value.scene
}

function applyPreset(preset: Preset): void {
  features.value = { ...preset.features }
  error.value = ''
}

function resetForm(): void {
  features.value = { ...DEFAULT_FEATURES }
  freeText.value = ''
  useLlm.value = false
  error.value = ''
}

function applyVision(res: VisionResponse): void {
  const visionKeys = [
    'nail_bed_ratio',
    'nail_shape',
    'length',
    'ita_band',
    'warmth',
    'hand_type',
  ] as const
  const patch: Record<string, string> = {}
  for (const key of visionKeys) {
    const value = res.features[key]
    if (typeof value === 'string' && value) patch[key] = value
  }
  features.value = { ...features.value, ...patch }
  showUpload.value = false
}

async function submit(): Promise<void> {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await api.recommend({
      features: features.value,
      free_text: freeText.value.trim() || undefined,
      use_llm: useLlm.value,
      library: library.value,
    })
    result.value = res
    llmReady.value = true
  } catch (err) {
    error.value = err instanceof ApiError ? err.detail : '推荐失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const sceneLabel = computed(() => SCENE_LABELS[features.value.scene] ?? features.value.scene)
</script>

<template>
  <div class="container">
    <!-- hero -->
    <section class="hero fade-in">
      <div class="eyebrow">NailFit · 甲适</div>
      <h1 style="margin-top: 10px">
        基于手部特征的<em>美甲推荐</em>
      </h1>
      <p class="lede">
        拍一张手照（可选），补一句自己的想法（可选），系统从款式库里挑出 3 个最合适的款式，并给出可解释的推荐理由。
        不生成图片、不做虚拟试戴，所有推荐结果都能追溯到款式库里的真实条目。
      </p>
      <div class="hero-meta">
        <span>规则引擎选款 · 模型只写理由</span>
        <span>输出契约校验（style_id 必须存在）</span>
        <span>款式库 {{ libraryCount || '…' }} 款</span>
        <span>当前场景：{{ sceneLabel }}</span>
      </div>
    </section>

    <div class="workbench">
      <div class="workbench-side">
        <FeatureForm
          v-model:features="features"
          v-model:free-text="freeText"
          v-model:use-llm="useLlm"
          v-model:library="library"
          :busy="loading"
          :llm-ready="llmReady"
          @submit="submit"
          @reset="resetForm"
          @preset="applyPreset"
        />

        <div class="side-extra panel panel-pad">
          <div class="panel-title">
            <h3>手照识别</h3>
            <span class="hint">可选 · 自动提取特征</span>
          </div>
          <p class="field-note" style="margin: 6px 0 12px">
            不上传照片也能用：直接手选 7 项特征即可。上传手照可减少输入，识别结果会先回填，再统一确认推荐。
          </p>
          <button class="btn btn-ghost btn-sm" type="button" @click="showUpload = !showUpload">
            {{ showUpload ? '收起上传面板' : '打开上传面板' }}
          </button>
        </div>
      </div>

      <div class="workbench-main">
        <PhotoUpload v-if="showUpload" :scene="currentScene()" :disabled="loading" @apply="applyVision" />

        <div v-if="stylesError" class="alert alert-error" style="margin-bottom: 14px">
          款式库加载失败：{{ stylesError }}。请确认后端已启动（默认 http://127.0.0.1:8000）。
        </div>

        <ResultBoard :result="result" :busy="loading" :error="error" />

        <section class="section">
          <div class="section-head">
            <div>
              <div class="eyebrow">款式库</div>
              <h2 style="margin-top: 4px">先看看款式库</h2>
            </div>
            <p>
              {{ libraryLabel }}共 {{ libraryCount || '…' }} 款，这里先展示 8 款；
              <router-link to="/library">查看全部 →</router-link>
            </p>
          </div>
          <StyleGallery v-if="styles.length" :styles="styles" :limit="8" />
          <div v-else class="gallery-grid">
            <div v-for="i in 4" :key="i" class="skeleton" style="aspect-ratio: 3 / 4.3" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workbench {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: clamp(16px, 2.6vw, 28px);
  align-items: start;
  margin-top: clamp(20px, 3vw, 32px);
}

.workbench-side {
  display: grid;
  gap: 16px;
}

.workbench-main {
  display: grid;
  gap: 20px;
}

@media (max-width: 980px) {
  .workbench {
    grid-template-columns: 1fr;
  }
}
</style>
