<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="page">
    <AppHeader />

    <main>
      <router-view v-slot="{ Component }">
        <transition name="view" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="container">
        <span>NailFit 甲适 · 基于手部特征的美甲推荐</span>
        <span>规则决定推荐什么，模型只决定怎么说</span>
        <span class="spacer">非商业个人项目 · 款式图仅为风格参考</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.view-enter-active,
.view-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.view-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.view-leave-to {
  opacity: 0;
}
</style>
