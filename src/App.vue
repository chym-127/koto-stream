<script setup lang="ts">
import DefaultLayout from './pages/layout/index.vue';
import { message } from 'ant-design-vue';
import eventBus from './utils/event_bus';
import { onUnmounted } from 'vue';
import windowHelper from './utils/window_helper';
import { Position } from 'tauri-plugin-positioner-api';

message.config({
  top: `2px`,
  duration: 2,
  maxCount: 3,
});

function SSEMsgCallBack(msg: { name: string; data: any }) {
  if (msg.name === 'IRREMOTE') {
    switch (msg.data) {
      //定位到左下角
      case '807FF00':
        windowHelper.moveWindow(Position.BottomLeft);
        break;
      //定位到右下角
      case '609FF00':
        windowHelper.moveWindow(Position.BottomRight);
        break;
      case '619FF00':
        location.reload();
        break;
      // 切换最小化
      case 'A45FF00':
        windowHelper.toggleMinimize();
        break;
      default:
        break;
    }
  }
}

eventBus.on('SSE-MSG', SSEMsgCallBack);

onUnmounted(() => {
  eventBus.off('SSE-MSG', SSEMsgCallBack);
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
