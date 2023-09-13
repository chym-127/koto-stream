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
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="媒体库路径" name="title">
              <a-input v-model:value="form.media_path" @blur="inputBlur('media_path')" placeholder="请输入媒体库路径" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div style="clear: both"></div>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue';
import eventBus from '../../../utils/event_bus';
import { settingStore } from '../../../utils/store';

const form = reactive({
  media_path: settingStore.get('media_path') || '',
});
const open = ref<boolean>(false);

function showModal() {
  open.value = !open.value;
}
const onClose = () => {
  open.value = false;
};

const menuClickCallback = function (data: any) {
  if (data.id === 'SETTING') {
    showModal();
  }
};

const inputBlur = (str: string) => {
  console.log(str);

  if (str === 'media_path') {
    settingStore.set(str, form.media_path, true);
  }
};

onUnmounted(() => {
  eventBus.off('menu-click', menuClickCallback);
});

eventBus.on('menu-click', menuClickCallback);
</script>
