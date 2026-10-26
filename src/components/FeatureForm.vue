<script setup lang="ts">
import { computed } from 'vue'
import type { Features, LibraryName } from '../types'
import { DEFAULT_FEATURES, FIELDS, LIBRARIES, LIBRARY_HINTS, PRESETS, type Preset } from '../options'

const props = defineProps<{
  busy: boolean
  llmReady: boolean
}>()

const emit = defineEmits<{
  submit: []
  reset: []
  preset: [preset: Preset]
}>()

const features = defineModel<Features>('features', { required: true })
const freeText = defineModel<string>('freeText', { required: true })
const useLlm = defineModel<boolean>('useLlm', { required: true })
const library = defineModel<LibraryName>('library', { required: true })

const isDefault = computed(
  () => JSON.stringify(features.value) === JSON.stringify(DEFAULT_FEATURES) && !freeText.value.trim(),
)

function pick(key: keyof Features, value: string): void {
  if (features.value[key] === value) return
  features.value = { ...features.value, [key]: value }
}

function toggleLlm(): void {
  if (!props.llmReady && !useLlm.value) {
    return
  }
  useLlm.value = !useLlm.value
}

function pickLibrary(value: string): void {
  if (value === 'sample' || value === 'demo') {
    library.value = value
  }
}
</script>

<template>
  <section class="panel panel-pad form-panel">
    <div class="panel-title">
      <h3>手部特征</h3>
      <span class="hint">右侧即时预览当前选择</span>
    </div>

    <div class="preset-row">
      <span class="preset-label">快速预设</span>
      <button
        v-for="preset in PRESETS"
        :key="preset.id"
        type="button"
        class="chip"
        :title="preset.desc"
        :disabled="busy"
        @click="emit('preset', preset)"
      >
        {{ preset.name }}
      </button>
    </div>

    <div class="field">
      <div class="field-label">
        <span>款式库</span>
        <span class="selected">{{ LIBRARIES.find((o) => o.value === library)?.label }}</span>
      </div>
      <div class="chip-group" role="group" aria-label="款式库">
        <button
          v-for="opt in LIBRARIES"
          :key="opt.value"
          type="button"
          class="chip"
          :class="{ active: library === opt.value }"
          :disabled="busy"
          :aria-pressed="library === opt.value"
          @click="pickLibrary(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <p class="field-note">{{ LIBRARY_HINTS[library] }}</p>
    </div>

    <div v-for="field in FIELDS" :key="String(field.key)" class="field">
      <div class="field-label">
        <span>{{ field.label }}</span>
        <span class="selected">
          {{ field.options.find((o) => o.value === features[field.key])?.label }}
        </span>
      </div>
      <div class="chip-group" role="group" :aria-label="field.label">
        <button
          v-for="opt in field.options"
          :key="opt.value"
          type="button"
          class="chip"
          :class="{ active: features[field.key] === opt.value }"
          :disabled="busy"
          :aria-pressed="features[field.key] === opt.value"
          @click="pick(field.key, opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="divider" />

    <div class="field">
      <div class="field-label">
        <span>补充描述（可选）</span>
        <span class="selected">{{ freeText.length }}/200</span>
      </div>
      <textarea
        v-model="freeText"
        class="textarea"
        maxlength="200"
        placeholder="例如：下周婚礼，想要温柔显白、不要夸张"
        :disabled="busy"
      />
      <p class="field-note">文字会解析为场景、审美偏好或负向约束，并参与规则加权。</p>
    </div>

    <label class="switch-row" title="用 LLM 生成推荐理由；未配置 Key 时自动退回模板">
      <span class="switch-text">
        用大模型生成理由
        <span class="field-note" style="display: block; margin-top: 2px">
          {{ llmReady ? '已配置 API Key' : '未检测到 Key，将使用模板理由' }}
        </span>
      </span>
      <button
        type="button"
        class="switch"
        :class="{ on: useLlm }"
        :disabled="busy || !llmReady"
        role="switch"
        :aria-checked="useLlm"
        :aria-label="useLlm ? '关闭大模型理由' : '开启大模型理由'"
        @click="toggleLlm"
      />
    </label>

    <div class="btn-row form-actions">
      <button class="btn btn-primary" type="button" :disabled="busy" @click="emit('submit')">
        <span v-if="busy" class="spin" aria-hidden="true" />
        {{ busy ? '推荐中…' : '开始推荐' }}
      </button>
      <button class="btn btn-ghost" type="button" :disabled="busy || isDefault" @click="emit('reset')">
        重置
      </button>
    </div>
  </section>
</template>

<style scoped>
.form-panel {
  position: sticky;
  top: 84px;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin: 12px 0 18px;
}

.preset-label {
  margin-right: 2px;
  color: var(--muted);
  font-size: 12px;
}

.field:last-of-type {
  margin-bottom: 0;
}

.form-actions {
  margin-top: 18px;
}

.form-actions .btn-primary {
  flex: 1;
}

.spin {
  width: 14px;
  height: 14px;
  border: 2px solid rgb(255 255 255 / 45%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .form-panel {
    position: static;
  }
}
</style>
