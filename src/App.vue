<script setup lang="ts">
import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/tauri';
import DefaultLayout from './pages/layout/index.vue';
const open = ref<boolean>(false);
const content = ref('');
function showModal() {
  open.value = true;
  console.log('show');
}

function handleOk() {
  let data = JSON.parse(content.value);
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const item = data[key];
      invoke('handle_create_video', {
        t: item,
      }).then((resp: any) => {});
    }
  }
}
</script>

<template>
  <div class="w-screen h-screen">
    <button @click="showModal" class="show-btn">Import</button>
    <a-modal v-model:visible="open" title="Basic Modal" @ok="handleOk">
      <textarea v-model="content" id="" cols="30" rows="10"></textarea>
    </a-modal>
    <DefaultLayout></DefaultLayout>
  </div>
</template>

<style lang="less" scoped>
.show-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
