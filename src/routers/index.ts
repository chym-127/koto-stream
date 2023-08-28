import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const Dashboard = () => import('../pages/dashboard/index.vue');
const VideoPage = () => import('../pages/video/index.vue');
const VideoPlayer = () => import('../pages/player/index.vue');


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
  {
    path: '/video/player',
    name: '视频播放',
    component: VideoPlayer,
    meta: {},
  },
];


const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
