<script setup lang="ts">
import DefaultLayout from './pages/layout/index.vue';
import { message } from 'ant-design-vue';

message.config({
  top: `2px`,
  duration: 2,
  maxCount: 1,
});
</script>

<template>
  <div class="w-screen h-screen">
    <DefaultLayout></DefaultLayout>
  </div>
</template>

<style>
.ant-drawer-header {
  display: none;
}

.ant-drawer-body {
  padding: 0;
}

.ant-tabs-nav {
  padding: 0 12px;
}
</style>
