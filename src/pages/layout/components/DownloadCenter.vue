<template>
  <a-drawer
    title="设置"
    :width="820"
    :zIndex="2000"
    :get-container="false"
    :pagination="false"
    :visible="visible"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
    <div style="padding: 0">
      <a-table :columns="columns" :data-source="cloneDeep(taskList)" bordered>
        <template #bodyCell="{ column, text, record }: any">
          <template v-if="column.dataIndex === 'name'">
            <span>{{ text }}</span>
          </template>
          <template v-if="column.dataIndex === 'progress'">
            <span v-if="text !== 'file..'">{{ text || 0 }}%</span>
            <span v-else>100%</span>
          </template>

          <template v-if="column.dataIndex === 'totalDuration'">
            <span>{{ text || '-' }}</span>
          </template>

          <template v-if="column.dataIndex === 'leftTime'">
            <span>{{ text || '-' }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue';
import m3u8Downloader, { M3u8DownTask } from '../../../utils/m3u8_helper';
import cloneDeep from 'lodash.clonedeep';
import eventBus from '../../../utils/event_bus';
const visible = ref(false);
const onClose = () => {
  visible.value = false;
};
const toggleVisible = () => {
  visible.value = !visible.value;
};

const menuClickCallback = function (data: any) {
  if (data.id === 'DOWNLOAD_CENTER') {
    toggleVisible();
  }
};

eventBus.on('menu-click', menuClickCallback);

const taskList = reactive<M3u8DownTask[]>([]);
const columns = [
  {
    title: '标题',
    width: 240,
    dataIndex: 'name',
  },
  {
    title: '进度',
    dataIndex: 'progress',
  },
  {
    title: '视频时长',
    width: 120,
    dataIndex: 'totalDuration',
  },
  {
    title: '剩余下载时间',
    width: 120,
    dataIndex: 'leftTime',
  },
  {
    title: '状态',
    width: 120,
    dataIndex: 'state',
  },
];

onUnmounted(() => {
  eventBus.off('menu-click', menuClickCallback);
  m3u8Downloader.destroy();
  clearInterval(p);
});

let p = setInterval(() => {
  taskList.splice(0);
  Object.assign(taskList, m3u8Downloader.getAllTask());
}, 100);
</script>

<style lang="less" scoped></style>
