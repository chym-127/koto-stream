<template>
  <div class="full">
    <a-layout class="full">
      <a-layout-sider v-if="false">
        <Menu></Menu>
      </a-layout-sider>
      <a-layout>
        <!-- <a-layout-header></a-layout-header> -->
        <a-layout-content class="bg-w">
          <router-view></router-view>
        </a-layout-content>
        <!-- <a-layout-footer>Footer</a-layout-footer> -->
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import Menu from './components/menu/index.vue';
</script>

<style lang="less" scoped>
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
