<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { LibraryInfo, LibraryName, Style } from '../types'
import { api, ApiError } from '../api'
import {
  COLOR_FAMILY_LABELS,
  LIBRARIES,
  LIBRARY_HINTS,
  LIBRARY_SHORT,
  STYLE_LABELS,
  pickDefaultLibrary,
} from '../options'
import StyleGallery from '../components/StyleGallery.vue'

const library = ref<LibraryName>('sample')
const libraryMeta = ref<Record<string, LibraryInfo>>({})
const styles = ref<Style[]>([])
const loading = ref(true)
const error = ref('')

const libraryLabel = computed(() => LIBRARY_SHORT[library.value] ?? '款式库')
const libraryHint = computed(() => {
  const base = LIBRARY_HINTS[library.value] ?? ''
  return libraryReady(library.value) ? base : `${base} · 图片缺失，请重跑 prepare_images.py`
})

function libraryReady(name: string): boolean {
  const meta = libraryMeta.value[name]
  if (!meta) return true
  return meta.available && meta.images_ready
}

const colorCount = computed(() => new Set(styles.value.map((s) => s.color_family)).size)
const styleCount = computed(() => new Set(styles.value.map((s) => s.style)).size)

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const res = await api.styles(library.value)
    styles.value = res.styles
  } catch (err) {
    styles.value = []
    error.value = err instanceof ApiError ? err.detail : '款式库加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const libs = await api.libraries()
    libraryMeta.value = Object.fromEntries(libs.libraries.map((item) => [item.name, item]))
    const preferred = pickDefaultLibrary(libs)
    if (preferred) library.value = preferred
  } catch {
    /* 拿不到库清单就按默认样例库加载 */
  }
  await load()
})

watch(library, () => void load())

const colorList = computed(() =>
  [...new Set(styles.value.map((s) => s.color_family))]
    .map((value) => COLOR_FAMILY_LABELS[value] ?? value)
    .join(' · '),
)

const styleList = computed(() =>
  [...new Set(styles.value.map((s) => s.style))].map((value) => STYLE_LABELS[value] ?? value).join(' · '),
)
</script>

<template>
  <div class="container">
    <section class="hero fade-in" style="padding-bottom: 8px">
      <div class="eyebrow">款式库</div>
      <h1 style="margin-top: 10px">全部款式，都可以被推荐</h1>
      <p class="lede">
        推荐只会从款式库里挑选真实条目，不做生成式试戴。每张图都带授权与来源信息；演示图仅为风格参考。
      </p>
      <div class="hero-meta">
        <span>当前：{{ libraryLabel }}</span>
        <span>共 {{ styles.length || '…' }} 款</span>
        <span>{{ colorCount }} 个色系：{{ colorList || '…' }}</span>
        <span>{{ styleCount }} 种款式：{{ styleList || '…' }}</span>
      </div>
    </section>

    <div class="chip-group section" style="margin-top: 4px" role="group" aria-label="款式库切换">
      <button
        v-for="item in LIBRARIES"
        :key="item.value"
        type="button"
        class="chip"
        :class="{ active: library === item.value }"
        :aria-pressed="library === item.value"
        :disabled="loading || !libraryReady(item.value)"
        :title="libraryReady(item.value) ? LIBRARY_HINTS[item.value] : '图片缺失，请在项目根目录重跑 prepare_images.py'"
        @click="library = item.value as LibraryName"
      >
        {{ item.label }}
      </button>
    </div>
    <p class="field-note" style="margin-top: 8px">{{ libraryHint }}</p>

    <div v-if="error" class="alert alert-error section">
      {{ error }}
      <button class="btn btn-ghost btn-sm" type="button" style="margin-left: 8px" @click="load">
        重试
      </button>
    </div>

    <div v-else-if="loading" class="gallery-grid section">
      <div v-for="i in 8" :key="i" class="skeleton" style="aspect-ratio: 3 / 4.3" />
    </div>

    <section v-else class="section">
      <StyleGallery :styles="styles" filters />
      <p class="field-note" style="margin-top: 16px">
        演示图来自公开平台截图，仅用于工程演示，版权归原作者；正式使用时请替换为自拍或可商用图库，见
        <code>docs/IMAGE_GUIDE.md</code>。
      </p>
    </section>

    <p style="margin-bottom: 8px">
      <router-link to="/">← 回到推荐工作台</router-link>
    </p>
  </div>
</template>
