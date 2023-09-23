<template>
  <a-drawer
    title="设置"
    :width="720"
    :get-container="false"
    :visible="props.visible"
    style="height: 100%; overflow: hidden"
    :body-style="{ paddingBottom: '40px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
    <div class="full flex-column" style="overflow: hidden">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="2" tab="剧集" force-render></a-tab-pane>
        <a-tab-pane key="3" tab="播放设置" force-render></a-tab-pane>
      </a-tabs>
      <div class="h-0 flex-1" style="overflow: auto">
        <div style="padding: 0 24px 24px 24px" v-show="activeKey === '2'">
          <a-table :columns="columns" :data-source="form.episodes" bordered>
            <template #bodyCell="{ column, text, record }: any">
              <template v-if="column.dataIndex === 'title'">
                <a-input v-model:value="record.title" disabled placeholder="请输入名称" />
              </template>
              <template v-if="column.dataIndex === 'url'">
                <a-input v-model:value="record.url" placeholder="请输入url" />
              </template>

              <template v-if="column.dataIndex === 'local_path'">
                <span>{{ text ? '已下载' : '未下载' }}</span>
              </template>

              <!-- <template v-if="column.dataIndex === 'action'">
                <a-button type="link" @click="onDown(record)">{{ record.file_path ? '重新下载' : '下载' }}</a-button>
              </template> -->
            </template>
          </a-table>
        </div>
        <div style="padding: 0 24px 24px 24px" v-show="activeKey === '3'">
          <a-form :model="playConfigForm" layout="horizontal">
            <a-row :gutter="16">
              <a-form-item label="自动跳过片头片尾">
                <a-switch v-model:checked="playConfigForm.auto_skip" />
              </a-form-item>
            </a-row>
            <a-row :gutter="16">
              <a-form-item label="片头时长">
                <a-input-number v-model:value="playConfigForm.start_duration" :min="0" :max="60 * 10" />
              </a-form-item>
            </a-row>

            <a-row :gutter="16">
              <a-form-item label="片尾时长">
                <a-input-number v-model:value="playConfigForm.end_duration" :min="0" :max="60 * 10" />
              </a-form-item>
            </a-row>
          </a-form>
        </div>
      </div>
    </div>
    <a-space style="position: absolute; top: 8px; right: 24px">
      <!-- <a-button @click=" onClose ">取消</a-button> -->
      <a-popconfirm title="你确认要删除这个资源吗?" ok-text="Yes" cancel-text="No" @confirm="handleDeleteVideo()">
        <a-button type="primary" danger>删除</a-button>
      </a-popconfirm>
      <a-button type="primary" @click="onSubmit">更新</a-button>
    </a-space>
  </a-drawer>
</template>
<script lang="ts" setup>
import { invoke } from '@tauri-apps/api/tauri';
import { reactive, ref } from 'vue';
import { Form } from 'ant-design-vue';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import type { Rule } from 'ant-design-vue/es/form';
import router from '../../routers';
import { updateMediaApi } from '../../api';

const props = defineProps<{
  visible: boolean;
  info: VideoInfo;
}>();
const emit = defineEmits(['update:visible', 'update']);

const form = reactive<VideoInfo>({
  id: 0,
  description: '',
  release_date: '',
  episodes: [],
  score: 0,
  title: '',
});

const playConfigForm = reactive<VideoPlayConfig>({
  auto_skip: false,
  start_duration: 0,
  end_duration: 0,
});

const activeKey = ref('2');

const rules: Record<string, Rule[]> = {
  title: [{ required: true, message: '请输入名称' }],
};

const useForm = Form.useForm;

const { resetFields, validate, validateInfos, clearValidate } = useForm(form, rules);
const onSubmit = () => {
  validate()
    .then(() => {
      handleUpdateVideo(form);
    })
    .catch((err) => {
      console.log('error', err);
    });
};

const onClose = () => {
  resetFields();
  clearValidate();
  emit('update:visible', false);
};

const resetInfo = () => {
  Object.assign(form, props.info);
  Object.assign(playConfigForm, form.expand);
};

defineExpose({ resetInfo });

function handleUpdateVideo(data: VideoInfo) {
  let resq = {
    id: data.id,
    episodes: data.episodes,
    play_config: JSON.stringify(playConfigForm),
  };
  updateMediaApi(resq).then((resp: any) => {
    emit('update');
  });
}

function handleDeleteVideo() {
  invoke('handle_del_video', {
    id: form.id,
  }).then((resp: any) => {
    router.push('/');
  });
}

const columns = [
  {
    title: '标题',
    width: 120,
    dataIndex: 'title',
  },
  {
    title: 'm3u8',
    dataIndex: 'url',
  },
  {
    title: '状态',
    width: 80,
    dataIndex: 'local_path',
  },
  // {
  //   title: '操作',
  //   width: 80,
  //   dataIndex: 'action',
  // },
];
</script>

<style lang="css"></style>
