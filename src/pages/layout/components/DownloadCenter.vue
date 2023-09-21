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
      <a-table :columns="columns" :data-source="taskList" bordered rowKey="id">
        <template #bodyCell="{ column, text, record }: any">
          <template v-if="column.dataIndex === 'name'">
            <span>{{ text }}</span>
          </template>
          <template v-if="column.dataIndex === 'episode_count'">
            <span>{{ record.download_count }}{{ '/' }}{{ record.episode_count }}</span>
          </template>

          <template v-if="column.dataIndex === 'success_count'">
            <span>{{ record.success_count }}/{{ record.failed_count }}</span>
          </template>

          <template v-if="column.dataIndex === 'type'">
            <span>{{ typeMapper[text] }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue';
import m3u8Downloader, { M3u8DownTask } from '../../../utils/m3u8_helper';
import eventBus from '../../../utils/event_bus';
import { listDownTask } from '../../../api';
const visible = ref(false);
const typeMapper: any = {
  1: '队列中',
  2: '下载中',
  3: '下载完成',
};
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
    dataIndex: 'title',
  },
  {
    title: '进度',
    dataIndex: 'episode_count',
  },
  {
    title: '成功/失败',
    dataIndex: 'success_count',
  },
  {
    title: '状态',
    width: 120,
    dataIndex: 'type',
  },
];

onUnmounted(() => {
  eventBus.off('menu-click', menuClickCallback);
  m3u8Downloader.destroy();
});

handleListTask();

function handleListTask() {
  listDownTask()
    .then((resp: any) => {
      taskList.splice(0);
      Object.assign(taskList, resp.data);
    })
    .finally(() => {
      setTimeout(() => {
        handleListTask();
      }, 5000);
    });
}
</script>

<style lang="less" scoped></style>
