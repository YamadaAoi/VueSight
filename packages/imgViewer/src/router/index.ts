import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/imgViewer',
    name: 'ImgViewer',
    component: () => import('../views/imgViewer/ImgViewer.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
