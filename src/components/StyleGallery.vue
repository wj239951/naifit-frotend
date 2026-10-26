<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Style } from '../types'
import { assetUrl } from '../api'
import { COLOR_FAMILY_LABELS, STYLE_LABELS } from '../options'

const props = withDefaults(
  defineProps<{
    styles: Style[]
    limit?: number
    filters?: boolean
  }>(),
  { limit: 0, filters: false },
)

const activeColor = ref('')
const activeStyle = ref('')
const keyword = ref('')

const colorOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const s of props.styles) counts.set(s.color_family, (counts.get(s.color_family) ?? 0) + 1)
  return [...counts.entries()].map(([value, count]) => ({
    value,
    label: COLOR_FAMILY_LABELS[value] ?? value,
    count,
  }))
})

const styleOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const s of props.styles) counts.set(s.style, (counts.get(s.style) ?? 0) + 1)
  return [...counts.entries()].map(([value, count]) => ({
    value,
    label: STYLE_LABELS[value] ?? value,
    count,
  }))
})

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const list = props.styles.filter((s) => {
    if (activeColor.value && s.color_family !== activeColor.value) return false
    if (activeStyle.value && s.style !== activeStyle.value) return false
    if (kw) {
      const haystack = `${s.id} ${s.name} ${s.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(kw)) return false
    }
    return true
  })
  return props.limit > 0 ? list.slice(0, props.limit) : list
})

function toggleColor(value: string): void {
  activeColor.value = activeColor.value === value ? '' : value
}

function toggleStyle(value: string): void {
  activeStyle.value = activeStyle.value === value ? '' : value
}

function resetFilters(): void {
  activeColor.value = ''
  activeStyle.value = ''
  keyword.value = ''
}
</script>

<template>
  <section>
    <div v-if="filters" class="filter-row">
      <input
        v-model="keyword"
        class="input search-input"
        type="search"
        placeholder="搜索款式名 / 标签，例如：法式、显白"
        aria-label="搜索款式"
      />
      <button
        class="chip"
        :class="{ active: !activeColor }"
        type="button"
        @click="activeColor = ''"
      >
        全部色系
      </button>
      <button
        v-for="opt in colorOptions"
        :key="opt.value"
        class="chip"
        :class="{ active: activeColor === opt.value }"
        type="button"
        @click="toggleColor(opt.value)"
      >
        {{ opt.label }} <span class="count">{{ opt.count }}</span>
      </button>
    </div>

    <div v-if="filters" class="filter-row">
      <button
        class="chip"
        :class="{ active: !activeStyle }"
        type="button"
        @click="activeStyle = ''"
      >
        全部款式
      </button>
      <button
        v-for="opt in styleOptions"
        :key="opt.value"
        class="chip"
        :class="{ active: activeStyle === opt.value }"
        type="button"
        @click="toggleStyle(opt.value)"
      >
        {{ opt.label }} <span class="count">{{ opt.count }}</span>
      </button>
      <button
        v-if="activeColor || activeStyle || keyword"
        class="btn btn-ghost btn-sm"
        type="button"
        style="margin-left: auto"
        @click="resetFilters"
      >
        清除筛选
      </button>
    </div>

    <p v-if="filters" class="field-note" style="margin-bottom: 12px">
      共 {{ filtered.length }} / {{ styles.length }} 款
    </p>

    <div v-if="filtered.length" class="gallery-grid">
      <article v-for="style in filtered" :key="style.id" class="gallery-item">
        <img
          :src="assetUrl((style.media?.image as string) || style.image)"
          :alt="`${style.name} 参考图`"
          loading="lazy"
        />
        <div class="gallery-caption">
          <strong>{{ style.name }}</strong>
          <span class="cap-tags">
            {{ COLOR_FAMILY_LABELS[style.color_family] ?? style.color_family }} ·
            {{ STYLE_LABELS[style.style] ?? style.style }} · {{ style.tags.slice(0, 2).join('、') }}
          </span>
        </div>
      </article>
    </div>

    <div v-else class="empty">
      <h3>没有符合条件的款式</h3>
      <p>换个关键词或清除筛选试试。</p>
    </div>
  </section>
</template>

<style scoped>
.search-input {
  flex: 1 1 220px;
  min-height: 38px;
  padding-block: 7px;
}

.count {
  color: var(--muted);
  font-size: 11px;
}

.chip.active .count {
  color: rgb(255 255 255 / 70%);
}
</style>
