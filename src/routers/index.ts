import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const Dashboard = () => import('../pages/dashboard/index.vue');
const VideoPage = () => import('../pages/dashboard/vod-details.vue');


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '首页',
    component: Dashboard,
    meta: {},
  },
  {
    path: '/video',
    name: '视频',
    component: VideoPage,
    meta: {},
  },

];


const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
