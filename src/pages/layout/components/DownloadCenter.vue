<template>
  <div class="download-center">
    <a-button style="position: absolute; bottom: 20px; left: 20px" @click="showModal">下载中心</a-button>

    <a-drawer
      title="设置"
      :width="820"
      :visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      :footer-style="{ textAlign: 'right' }"
      @close="onClose"
    >
      <div style="padding: 0">
        <a-table :columns="columns" :data-source="cloneDeep(taskList)" bordered>
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'name'">
              <span>{{ text }}</span>
            </template>
            <template v-if="column.dataIndex === 'progress'">
              <span v-if="text !== 'file..'">{{ text }}%</span>
              <span v-else>100%</span>
            </template>

            <template v-if="column.dataIndex === 'totalDuration'">
              <span>{{ text }}</span>
            </template>

            <template v-if="column.dataIndex === 'leftTime'">
              <span>{{ text }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import m3u8Downloader, { M3u8DownTask } from '../../../utils/m3u8_helper';
import cloneDeep from 'lodash.clonedeep';

const visible = ref(false);
const showModal = () => {
  visible.value = true;
};
const onClose = () => {
  visible.value = false;
};

const taskList = reactive<M3u8DownTask[]>([]);
const columns = [
  {
    title: '标题',
    width: 120,
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
    title: '状态',
    width: 120,
    dataIndex: 'state',
  },
  {
    title: '剩余下载时间',
    width: 120,
    dataIndex: 'leftTime',
  },
];

setInterval(() => {
  taskList.splice(0);
  Object.assign(taskList, m3u8Downloader.getAllTask());
}, 100);
</script>

<style lang="less" scoped>
.download-center {
  position: relative;
  z-index: 99999;
}
</style>
