<template>
  <div data-tauri-drag-region class="titlebar">
    <div class="app-name flex-row items-center p-4" data-tauri-drag-region>
      <span class="font-16-800">KOTO_STREAM</span>
    </div>
    <div class="menu flex-row flex-1 ml-8" data-tauri-drag-region>
      <div class="menu-item flex-row items-center" v-for="(item, index) in menus" @click="menuClick(item)" :key="index">
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div class="action-btns flex-row" data-tauri-drag-region>
      <div class="flex-1 flex-row items-center p-8 btn" @click="minimize">
        <svg class="icon font-16-400" aria-hidden="true">
          <use xlink:href="#icon-a-Remove_24_Outline"></use>
        </svg>
      </div>
      <div class="flex-1 flex-row items-center p-8 btn" @click="close">
        <svg class="icon font-16-400" aria-hidden="true">
          <use xlink:href="#icon-a-Close_24_Outline"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window';
import eventBus, { EventMsg } from '../../../utils/event_bus';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Menu {
  id: string;
  name: string;
}

const menus = reactive<Menu[]>([
  {
    id: 'BACK',
    name: '返回',
  },
  {
    id: 'DOWNLOAD_CENTER',
    name: '下载中心',
  },
]);

const menuClick = (menu: Menu) => {
  let msg: EventMsg = {
    id: 'menu-click',
    name: '点击菜单事件',
    data: menu,
  };
  if (menu.id === 'BACK') {
    router.go(-1);
  } else {
    eventBus.publicize(msg);
  }
};

const minimize = () => {
  appWindow.minimize();
};

const close = () => {
  appWindow.close();
};
</script>

<style lang="less" scoped>
.titlebar {
  height: 100%;
  user-select: none;
  background-color: #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.menu-item {
  padding: 8px;
  cursor: pointer;
  color: #333333;
  &:hover {
    background-color: #cccccc;
    color: #222;
  }
}

.btn {
  cursor: pointer;
}
</style>
