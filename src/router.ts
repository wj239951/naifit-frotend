import { createRouter, createWebHashHistory } from 'vue-router'
import WorkbenchView from './views/WorkbenchView.vue'
import LibraryView from './views/LibraryView.vue'

// 用 hash 路由：无需服务器 rewrite，静态托管 / file:// 预览都能直接用。
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'workbench', component: WorkbenchView, meta: { title: '推荐工作台' } },
    { path: '/library', name: 'library', component: LibraryView, meta: { title: '款式库' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'NailFit'
  document.title = `${title} · NailFit 甲适`
})

export default router
