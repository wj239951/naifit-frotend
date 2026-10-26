<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { api, assetUrl, ApiError } from '../api'
import type { VisionResponse } from '../types'
import { FIELD_LABELS, QUALITY_LABELS } from '../options'

const props = defineProps<{
  scene: string
  disabled: boolean
}>()

const emit = defineEmits<{
  apply: [result: VisionResponse]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const previewUrl = ref('')
const dragging = ref(false)
const busy = ref(false)
const error = ref('')
const result = ref<VisionResponse | null>(null)

const DISPLAY_KEYS = ['nail_bed_ratio', 'nail_shape', 'length', 'ita_band', 'warmth', 'hand_type'] as const

const featureRows = computed(() => {
  const f = result.value?.features ?? {}
  const conf = result.value?.confidences ?? {}
  return DISPLAY_KEYS.map((key) => ({
    key,
    label: FIELD_LABELS[key] ?? key,
    value: typeof f[key] === 'string' ? String(f[key]) : '',
    confidence: typeof conf[key] === 'number' ? Math.round(conf[key] * 100) : null,
    unreliable: result.value?.unreliable?.includes(key) ?? false,
  })).filter((row) => Boolean(row.value))
})

const qualityLabel = computed(() => {
  const q = result.value?.quality
  return q ? (QUALITY_LABELS[q] ?? q) : ''
})

function cleanup(): void {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

function chooseFile(): void {
  if (props.disabled || busy.value) return
  inputRef.value?.click()
}

function onPicked(event: Event): void {
  const list = (event.target as HTMLInputElement).files
  if (list && list[0]) acceptFile(list[0])
}

function acceptFile(f: File): void {
  error.value = ''
  result.value = null
  if (!f.type.startsWith('image/')) {
    error.value = '请选择图片文件（JPG / PNG / WebP）。'
    return
  }
  if (f.size > 12 * 1024 * 1024) {
    error.value = '图片过大（超过 12 MB），请压缩后再试。'
    return
  }
  cleanup()
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  const f = event.dataTransfer?.files?.[0]
  if (f) acceptFile(f)
}

async function extract(): Promise<void> {
  if (!file.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    result.value = await api.visionUpload(file.value, props.scene)
  } catch (err) {
    error.value = err instanceof ApiError ? err.detail : '识别失败，请稍后重试。'
  } finally {
    busy.value = false
  }
}

function apply(): void {
  if (result.value) emit('apply', result.value)
}

function reset(): void {
  cleanup()
  file.value = null
  result.value = null
  error.value = ''
}

onBeforeUnmount(cleanup)
</script>

<template>
  <section class="panel panel-pad upload-panel">
    <div class="panel-title">
      <h3>手照识别</h3>
      <span class="hint">识别结果会先回填，再统一确认推荐</span>
    </div>

    <div class="uploader" style="margin-top: 14px">
      <div>
        <div
          class="dropzone"
          :class="{ dragover: dragging }"
          role="button"
          tabindex="0"
          @click="chooseFile"
          @keydown.enter.prevent="chooseFile"
          @keydown.space.prevent="chooseFile"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
        >
          <template v-if="previewUrl">
            <img :src="previewUrl" alt="待识别的手照预览" class="preview-img" />
          </template>
          <template v-else>
            <span class="dz-icon" aria-hidden="true">◍</span>
            <strong>点击或拖入手部照片</strong>
            <span>正面、五指分开、光线均匀效果最好</span>
            <span class="field-note">支持 JPG / PNG / WebP，≤ 12 MB</span>
          </template>
        </div>

        <input
          ref="inputRef"
          type="file"
          accept="image/*"
          hidden
          :disabled="disabled || busy"
          @change="onPicked"
        />

        <div class="btn-row" style="margin-top: 12px">
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="!file || busy || disabled"
            @click="extract"
          >
            {{ busy ? '识别中…' : '识别手部特征' }}
          </button>
          <button
            class="btn btn-ghost btn-sm"
            type="button"
            :disabled="!file || busy"
            @click="reset"
          >
            清除
          </button>
        </div>
      </div>

      <div>
        <div v-if="error" class="alert alert-error" style="margin-bottom: 12px">{{ error }}</div>

        <template v-if="result">
          <div class="vision-head">
            <span class="tag">识别质量：{{ qualityLabel }}</span>
            <span v-if="result.handedness" class="tag">手别：{{ result.handedness }}</span>
            <span v-if="result.gesture" class="tag">手势：{{ result.gesture }}</span>
            <span class="tag" style="margin-left: auto">
              仅回填可识别字段，其余保持手选
            </span>
          </div>

          <div class="vision-grid" style="margin-top: 10px">
            <div
              v-for="row in featureRows"
              :key="row.key"
              class="vision-item"
              :class="{ unreliable: row.unreliable }"
            >
              <span class="label">{{ row.label }}：<b>{{ row.value }}</b></span>
              <span v-if="row.confidence !== null" class="conf">{{ row.confidence }}%</span>
            </div>
          </div>

          <p v-if="result.unreliable?.length" class="field-note" style="margin-top: 10px">
            这些字段置信度较低，建议手动确认：{{ result.unreliable.join('、') }}
          </p>

          <div class="btn-row" style="margin-top: 12px">
            <button class="btn btn-primary btn-sm" type="button" @click="apply">
              应用到表单
            </button>
            <span class="field-note" style="align-self: center">
              应用后仍可在左侧修改，再点「开始推荐」
            </span>
          </div>
        </template>

        <div v-else class="notice">
          <span>
            <strong>说明：</strong>视觉层基于 MediaPipe 21 关键点 + 几何启发式；侧拍、握拳、遮挡时置信度会下降，可手动补全。此功能需要后端安装
            <code>requirements-vision.txt</code> 依赖。
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vision-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.field-note {
  color: var(--muted);
  font-size: 12px;
}

.vision-item .label {
  color: var(--ink-soft);
}
</style>
