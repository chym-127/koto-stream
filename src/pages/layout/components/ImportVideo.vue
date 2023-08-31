<template>
  <a-drawer
    :width="820"
    :get-container="false"
    :visible="open"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
    <div class="p-24">
      <textarea v-model="content" id="" cols="30" rows="10" class="full"></textarea>
      <a-button type="primary" @click="handleOk" style="float: right">导入</a-button>
      <div style="clear: both"></div>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri';
import { onUnmounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import eventBus from '../../../utils/event_bus';

const open = ref<boolean>(false);
const content = ref('');
function showModal() {
  open.value = !open.value;
}
const onClose = () => {
  open.value = false;
};

const menuClickCallback = function (data: any) {
  if (data.id === 'IMPORT_VIDEO') {
    showModal();
  }
};

onUnmounted(() => {
  eventBus.off('menu-click', menuClickCallback);
});

eventBus.on('menu-click', menuClickCallback);

function handleOk() {
  let data = null;
  try {
    data = JSON.parse(content.value);
  } catch (error) {
    message.error('JSON格式错误');
    return;
  }

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const item = data[key];
      item['episodes'] = JSON.stringify(item['episodes']);

      invoke('handle_create_video', {
        t: item,
      }).then((resp: any) => {
        message.success('导入成功');
        showModal()
      });
    }
  }
}
</script>
