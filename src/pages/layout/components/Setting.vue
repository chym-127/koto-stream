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
      <a-form :model="form" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="媒体库路径" name="title">
              <a-input
                v-model:value="form.media_path"
                @blur="inputBlur('media_path', form.media_path)"
                placeholder="请输入媒体库路径"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="API地址" name="title">
              <a-input
                v-model:value="form.api_base_url"
                @blur="inputBlur('api_base_url', form.api_base_url)"
                placeholder="请输入API地址"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="媒体库操作" name="title">
              <a-space style="width: 100%">
                <a-button type="primary" :loading="downAllMediaLoading" @click="downAllMedia">
                  下载所有未本地化的媒体
                </a-button>
                <a-button type="primary" :loading="updateAllMediaMetaLoading" @click="updateAllMediaMeta">
                  更新媒体资料
                </a-button>
              </a-space>
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
import { downAllMediaNotLocal, updateAllMediaMetaApi } from '../../../api';
import { message } from 'ant-design-vue';

const form = reactive({
  media_path: settingStore.get('media_path') || '',
  api_base_url: settingStore.get('api_base_url') || '',
});
const open = ref<boolean>(false);

const downAllMediaLoading = ref<boolean>(false);
const updateAllMediaMetaLoading = ref<boolean>(false);

function downAllMedia() {
  downAllMediaLoading.value = true;
  downAllMediaNotLocal()
    .then(() => {
      message.success('操作成功');
    })
    .catch(() => {})
    .finally(() => {
      downAllMediaLoading.value = false;
    });
}

function updateAllMediaMeta() {
  updateAllMediaMetaLoading.value = true;
  updateAllMediaMetaApi()
    .then(() => {
      message.success('操作成功');
    })
    .catch(() => {})
    .finally(() => {
      updateAllMediaMetaLoading.value = false;
    });
}

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

const inputBlur = (key: string, value: string) => {
  settingStore.set(key, value, true);
};

onUnmounted(() => {
  eventBus.off('menu-click', menuClickCallback);
});

eventBus.on('menu-click', menuClickCallback);
</script>
