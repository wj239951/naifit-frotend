<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '../api'

type HealthState = 'checking' | 'ok' | 'warn' | 'err'

const state = ref<HealthState>('checking')
const label = ref('检查后端…')
let timer: number | undefined

async function check(): Promise<void> {
  try {
    const res = await api.health()
    state.value = res.status === 'ok' ? 'ok' : 'warn'
    label.value = res.status === 'ok' ? '后端已连接' : `后端状态 ${res.status}`
  } catch {
    state.value = 'err'
    label.value = '后端未连接'
  }
}

onMounted(() => {
  void check()
  timer = window.setInterval(() => void check(), 20000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <header class="app-header">
    <div class="container">
      <router-link to="/" class="brand" aria-label="回到推荐工作台">
        <span class="brand-mark">甲</span>
        <span>
          NailFit
          <span class="brand-sub">甲适 · 手型美甲推荐</span>
        </span>
      </router-link>

      <nav class="nav-links" aria-label="主导航">
        <router-link to="/">推荐工作台</router-link>
        <router-link to="/library">款式库</router-link>
      </nav>

      <div class="header-tail">
        <button
          class="btn btn-ghost btn-sm"
          type="button"
          :title="`点击重新检查后端：${label}`"
          @click="check"
        >
          <span class="health-dot" :class="state">
            <i />
            {{ label }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.health-dot {
  color: inherit;
}

.header-tail .btn {
  min-height: 34px;
  padding: 5px 12px;
  cursor: pointer;
}
</style>
