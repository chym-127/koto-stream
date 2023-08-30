<template>
  <div class="full">
    <a-layout class="full">
      <a-layout-sider v-if="false">
        <Menu></Menu>
      </a-layout-sider>
      <a-layout>
        <!-- <a-layout-header></a-layout-header> -->
        <a-layout-content class="bg-w">
          <button class="back-btn" @click="back" v-if="route.path !== '/'">Back</button>
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
    <DownloadCenter></DownloadCenter>
  </div>
</template>

<script setup lang="ts">
import Menu from './components/menu/index.vue';
import DownloadCenter from './components/DownloadCenter.vue'
import { useRouter, useRoute } from 'vue-router';

const router = useRouter()
const route = useRoute()


function back() {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.back-btn {
  z-index: 9;
  padding: 2px 6px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  left: 10px;
}

.ant-layout-sider {
  background-color: var(--menu_bg-color);
  // border-right: 1px solid #f0f0f0;
}

.ant-layout-header {
  background-color: var(--content_bg-color);
  border-bottom: 1px solid #f0f0f0;
}

.ant-layout-content {
  background-color: var(--content_bg-color);
}
</style>
