<template>
  <a-drawer
    title="设置"
    :width="720"
    :visible="props.visible"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="基础信息">
        <div style="padding: 0 24px 24px 24px">
          <a-form :model="form" :rules="rules" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="名称" name="title" v-bind="validateInfos.title">
                  <a-input v-model:value="form.title" placeholder="请输入名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="导演">
                  <a-input v-model:value="form.director" style="width: 100%" placeholder="请输入导演名" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="演员">
                  <a-input v-model:value="form.actor" style="width: 100%" placeholder="请输入演员名" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="类型">
                  <a-input v-model:value="form.class" style="width: 100%" placeholder="请输入类型" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="制片国家">
                  <a-input v-model:value="form.area" style="width: 100%" placeholder="请输入制片国家" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="又名">
                  <a-input v-model:value="form.alias" style="width: 100%" placeholder="请输入类型" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="封面图">
                  <a-input v-model:value="form.image" style="width: 100%" placeholder="请输入封面图" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="背景墙">
                  <a-input-group compact>
                    <a-input v-model:value="form.bg" style="width: calc(100% - 100px)" placeholder="请输入背景墙图片" />
                    <a-button type="primary" style="width: 100px" @click="saveToLocal(form.bg!, 'image.webp')">
                      下载到本地
                    </a-button>
                  </a-input-group>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="剧情简介" name="description">
                  <a-textarea v-model:value="form.description" :rows="15" placeholder="请输入剧情简介" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="剧集" force-render>
        <div style="padding: 0 24px 24px 24px">
          <a-table :columns="columns" :data-source="form.episodes" bordered>
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'title'">
                <a-input v-model:value="record.title" placeholder="请输入名称" />
              </template>
              <template v-if="column.dataIndex === 'url'">
                <a-input v-model:value="record.url" placeholder="请输入url" />
              </template>

              <template v-if="column.dataIndex === 'file_path'">
                <span>{{ text ? '已下载' : '未下载' }}</span>
              </template>

              <template v-if="column.dataIndex === 'action'">
                <a-button type="link" @click="onDown(record)">{{ record.file_path ? '重新下载' : '下载' }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <a-space style="position: absolute; top: 8px; right: 24px">
      <a-button @click="onClose">取消</a-button>
      <a-button type="primary" @click="onSubmit">更新</a-button>
      <!-- <a-button type="primary" @click="onDown">测试下载</a-button> -->
    </a-space>
  </a-drawer>
</template>
<script lang="ts" setup>
import { invoke } from '@tauri-apps/api/tauri';
import { reactive, ref, toRaw } from 'vue';
import { Form } from 'ant-design-vue';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import type { Rule } from 'ant-design-vue/es/form';
import m3u8Downloader, { M3u8DownTask } from '../../utils/m3u8_helper';
import { exists, BaseDirectory } from '@tauri-apps/api/fs';

const documentPath = BaseDirectory.Document;

const props = defineProps<{
  visible: boolean;
  info: VideoInfo;
}>();
const emit = defineEmits(['update:visible', 'update']);

const form = reactive<VideoInfo>({
  id: 0,
  actor: '',
  alias: '',
  area: '',
  class: '',
  description: '',
  director: '',
  image: '',
  otitle: '',
  release_date: '',
  episodes: [],
  score: '',
  title: '',
  bg: '',
});

const activeKey = ref('1');

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
};

defineExpose({ resetInfo });

function handleUpdateVideo(data: VideoInfo) {
  let resq = {
    ...data,
    episodes: JSON.stringify(data.episodes),
  };
  invoke('handle_update_video', {
    t: resq,
  }).then((resp: any) => {
    emit('update');
  });
}

function saveToLocal(url: string, file_name: string) {
  invoke('handle_down_file', {
    req: {
      url: url,
      path: String(form.id),
      file_name: file_name,
    },
  })
    .then((resp: any) => {
      Object.assign(form, { bg: convertFileSrc(resp.data) });
    })
    .catch((e) => {
      console.log(e);
    });
}

let workPath = '';
invoke('handle_get_work_path', {}).then((resp: any) => {
  workPath = resp.data;
});

const onDown = (e: Episode) => {
  let task: M3u8DownTask = {
    uuid: form.id + '-' + e.index,
    name: form.title + '-' + e.title,
    url: e.url,
    workPath: workPath + '\\' + form.id,
    outputFilePath: workPath + '\\' + form.id + '\\' + e.index + '.mp4',
  };
  m3u8Downloader.submitTask(task);
};
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
    dataIndex: 'file_path',
  },
  {
    title: '操作',
    width: 80,
    dataIndex: 'action',
  },
];
</script>

<style lang="css">
.ant-drawer-header {
  display: none;
}

.ant-drawer-body {
  padding: 0;
}

.ant-tabs-nav {
  padding: 0 12px;
}
</style>
