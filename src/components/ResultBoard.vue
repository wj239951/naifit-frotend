<script setup lang="ts">
import { computed } from 'vue'
import type { RecommendResponse, Recommendation, StyleMedia } from '../types'
import { assetUrl, downloadJson } from '../api'
import {
  COLOR_FAMILY_LABELS,
  LICENSE_LABELS,
  LENGTH_FIT_LABELS,
  STYLE_LABELS,
  TIER_HINTS,
  TIER_LABELS,
  humanizeRule,
} from '../options'

const props = defineProps<{
  result: RecommendResponse | null
  busy: boolean
  error: string
}>()

const tiers = computed(() => props.result?.recommendations ?? [])

function mediaOf(rec: Recommendation): StyleMedia | null {
  return rec.media ?? null
}

function imageOf(rec: Recommendation): string {
  return assetUrl(mediaOf(rec)?.image || rec.image)
}

function captionOf(rec: Recommendation): string {
  const media = mediaOf(rec)
  if (!media) return ''
  const parts: string[] = []
  const licenseText = media.license ? (LICENSE_LABELS[media.license] ?? media.license) : ''
  if (licenseText) parts.push(licenseText)
  if (media.provider === 'openverse' && media.creator) parts.push(`作者 ${media.creator}`)
  if (media.source_url) parts.push('查看来源')
  return parts.join(' · ')
}

function copyJson(): void {
  if (!props.result) return
  void navigator.clipboard
    ?.writeText(JSON.stringify(props.result, null, 2))
    .then(() => {
      /* 忽略复制失败 */
    })
    .catch(() => undefined)
}

function download(): void {
  if (props.result) downloadJson(props.result, `nailfit-recommend-${Date.now()}.json`)
}
</script>

<template>
  <section class="panel panel-pad result-panel">
    <div class="section-head" style="margin-bottom: 14px">
      <div>
        <div class="eyebrow">三档推荐</div>
        <h2 style="margin-top: 4px">
          稳妥 · 亮点 · 大胆，各一张
        </h2>
      </div>
      <p v-if="result" class="result-meta">
        候选 {{ result.meta.candidates_considered }} 款 · 排除 {{ result.meta.excluded }} 款 ·
        {{ result.meta.engine }} · 理由{{ result.meta.explainer?.mode === 'llm' ? '由模型生成' : '模板生成' }}
      </p>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else-if="busy && !tiers.length" class="result-grid">
      <div v-for="i in 3" :key="i" class="skeleton" style="aspect-ratio: 3 / 4.6" />
    </div>

    <div v-else-if="!tiers.length" class="empty">
      <h3>还没有推荐结果</h3>
      <p>在左侧确认 7 项手部特征（或用快速预设），然后点击「开始推荐」。</p>
    </div>

    <div v-else class="result-grid">
      <article v-for="(rec, index) in tiers" :key="rec.style_id" class="result-card" :style="{ animationDelay: `${index * 60}ms` }">
        <div class="result-media">
          <img :src="imageOf(rec)" :alt="`${rec.name} 款式参考图`" loading="lazy" />
          <span class="tier-badge" :class="`tier-${rec.tier}`">
            {{ TIER_LABELS[rec.tier] ?? rec.tier }}
          </span>
          <span class="score-badge" :title="'规则匹配得分'">
            {{ rec.match_score.toFixed(2) }}
          </span>
        </div>

        <div class="result-body">
          <div>
            <h3>{{ rec.name }}</h3>
            <p class="field-note" style="margin-top: 2px">{{ TIER_HINTS[rec.tier] }}</p>
          </div>

          <div class="result-sub">
            <span class="tag">{{ COLOR_FAMILY_LABELS[rec.color_family] ?? rec.color_family }}</span>
            <span class="tag">{{ STYLE_LABELS[rec.style] ?? rec.style }}</span>
            <span v-if="rec.length_fit" class="tag">{{ LENGTH_FIT_LABELS[rec.length_fit] ?? rec.length_fit }}</span>
            <span v-for="shape in rec.shape.slice(0, 2)" :key="shape" class="tag">{{ shape }}</span>
          </div>

          <p class="reason">{{ rec.reason }}</p>

          <div v-if="rec.matched_rules.length" class="matched">
            <span v-for="rule in rec.matched_rules" :key="rule">{{ humanizeRule(rule) }}</span>
          </div>

          <p v-if="rec.caution" class="caution">{{ rec.caution }}</p>

          <div v-if="mediaOf(rec)" class="media-note">
            <span v-if="captionOf(rec)">{{ captionOf(rec) }}</span>
            <a
              v-if="mediaOf(rec)?.source_url"
              :href="mediaOf(rec)?.source_url ?? '#'"
              target="_blank"
              rel="noopener noreferrer"
            >
              来源链接
            </a>
          </div>
        </div>
      </article>
    </div>

    <template v-if="result">
      <div v-if="result.avoid.length" class="avoid-block">
        <h3 class="avoid-title">需要避开的款式</h3>
        <ul class="avoid-list">
          <li v-for="tip in result.avoid" :key="tip">{{ tip }}</li>
        </ul>
      </div>

      <details class="json-panel" style="margin-top: 18px">
        <summary>查看完整 JSON（可用于调试 / 复现）</summary>
        <pre class="json-body">{{ JSON.stringify(result, null, 2) }}</pre>
        <div class="json-toolbar">
          <button class="btn btn-ghost btn-sm" type="button" @click="copyJson">复制</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="download">下载 JSON</button>
        </div>
      </details>
    </template>
  </section>
</template>

<style scoped>
.result-panel {
  min-height: 320px;
}

.result-meta {
  color: var(--muted);
  font-size: 12.5px;
  text-align: right;
}

.media-note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--line);
  color: var(--muted);
  font-size: 11.5px;
}

.media-note a {
  color: var(--brand);
}

.avoid-block {
  margin-top: 20px;
}

.avoid-title {
  font-size: 15px;
  margin-bottom: 10px;
}

@media (max-width: 680px) {
  .result-meta {
    text-align: left;
  }
}
</style>
