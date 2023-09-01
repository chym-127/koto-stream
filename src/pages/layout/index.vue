<template>
  <div class="full main-box" data-tauri-drag-region>
    <div class="header" data-tauri-drag-region>
      <MenuBar></MenuBar>
    </div>
    <div class="content" id="content">
      <router-view></router-view>
      <DownloadCenter :style="{ position: 'absolute' }"></DownloadCenter>
      <ImportVideo :style="{ position: 'absolute' }"></ImportVideo>
      <TipsConfirm :style="{ position: 'absolute' }"></TipsConfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuBar from './components/MenuBar.vue';
import DownloadCenter from './components/DownloadCenter.vue';
import ImportVideo from './components/ImportVideo.vue';
import TipsConfirm from './components/TipsConfirm.vue';
</script>

<style lang="less" scoped>
.main-box {
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    height: 32px;
  }
  .content {
    height: 0;
    position: relative;
    width: 100%;
    flex: 1;
  }
}

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
