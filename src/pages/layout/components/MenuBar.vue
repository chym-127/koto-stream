<template>
  <div data-tauri-drag-region class="titlebar">
    <div v-if="menuVisible" class="app-name flex-row items-center p-4 mr-8" data-tauri-drag-region>
      <span class="font-16-800" data-tauri-drag-region>KOTO_STREAM</span>
    </div>
    <div class="menu flex-row flex-1" style="justify-content: space-between" data-tauri-drag-region>
      <template v-if="menuVisible">
        <div class="flex-row">
          <div
            class="menu-item flex-row items-center"
            v-for="(item, index) in menus"
            @click="menuClick(item)"
            :key="index"
          >
            <span>{{ item.name }}</span>
          </div>
        </div>
      </template>

      <div class="flex-row">
        <div
          class="menu-item flex-row items-center"
          v-for="(item, index) in customMenus"
          @click="customMenuClick(item)"
          :key="index"
        >
          <span>{{ item.name }}</span>
        </div>
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
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import eventBus, { EventMsg } from '../../../utils/event_bus';
import { onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuVisible = ref(true);

interface Menu {
  id: string;
  name: string;
  clickFunc?: () => void;
}

const menus = reactive<Menu[]>([
  {
    id: 'BACK',
    name: '返回',
  },
  {
    id: 'REFRESH',
    name: '刷新',
  },
  {
    id: 'DOWNLOAD_CENTER',
    name: '下载中心',
  },
  {
    id: 'IMPORT_VIDEO',
    name: '导入视频',
  },
  {
    id: 'SETTING',
    name: '设置',
  },
]);

const customMenus = reactive<Menu[]>([]);

const customMenuClick = (menu: Menu) => {
  menu.clickFunc!();
};

const menuClick = (menu: Menu) => {
  if (menu.id === 'BACK') {
    router.go(-1);
  } else if (menu.id === 'REFRESH') {
    window.location.reload();
  } else {
    let msg: EventMsg = {
      id: 'menu-click',
      name: '点击菜单事件',
      data: menu,
    };
    eventBus.publicize(msg);
  }
};

const setCustomMenuCallback = function (data: Menu[]) {
  customMenus.splice(0);
  Object.assign(customMenus, data);
};
const toggleMenuBar = function (visible: boolean) {
  menuVisible.value = visible;
};

eventBus.on('set-custom-menu', setCustomMenuCallback);
eventBus.on('toggle-menu-bar', toggleMenuBar);

onUnmounted(() => {
  eventBus.off('set-custom-menu', setCustomMenuCallback);
  eventBus.off('toggle-menu-bar', toggleMenuBar);
});

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
