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
        <a-tab-pane key="1" tab="基础信息"></a-tab-pane>
        <a-tab-pane key="2" tab="剧集" force-render></a-tab-pane>
        <a-tab-pane key="3" tab="播放设置" force-render></a-tab-pane>
      </a-tabs>
      <div class="h-0 flex-1" style="overflow: auto">
        <div style="padding: 0 24px 24px 24px" v-show="activeKey === '1'">
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
                  <a-input-group compact>
                    <a-input v-model:value="form.image" style="width: calc(100% - 100px)" placeholder="请输入封面图" />
                    <a-button
                      type="primary"
                      style="width: 100px"
                      :loading="imageLoading"
                      @click="saveToLocal(form.image!, 'image.png', 'image')"
                    >
                      下载
                    </a-button>
                  </a-input-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="背景墙">
                  <a-input-group compact>
                    <a-input v-model:value="form.bg" style="width: calc(100% - 100px)" placeholder="请输入背景墙图片" />
                    <a-button
                      type="primary"
                      style="width: 100px"
                      :loading="bgLoading"
                      @click="saveToLocal(form.bg!, 'bg.png', 'bg')"
                    >
                      下载
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
        <div style="padding: 0 24px 24px 24px" v-show="activeKey === '2'">
          <a-table :columns="columns" :data-source="form.episodes" bordered>
            <template #bodyCell="{ column, text, record }: any">
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
import m3u8Downloader, { M3u8DownTask } from '../../utils/m3u8_helper';
import router from '../../routers';

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

const playConfigForm = reactive<VideoPlayConfig>({
  auto_skip: false,
  start_duration: 0,
  end_duration: 0,
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
  Object.assign(playConfigForm, form.expand);
};

defineExpose({ resetInfo });

function handleUpdateVideo(data: VideoInfo) {
  let resq = {
    ...data,
    episodes: JSON.stringify(data.episodes),
    expand: JSON.stringify(playConfigForm),
  };
  invoke('handle_update_video', {
    t: resq,
  }).then((resp: any) => {
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

const imageLoading = ref(false);
const bgLoading = ref(false);

function saveToLocal(url: string, file_name: string, key: string) {
  if (key === 'image') {
    imageLoading.value = true;
  }
  if (key === 'bg') {
    bgLoading.value = true;
  }
  invoke('handle_down_file', {
    req: {
      url: url,
      path: String(form.id),
      file_name: file_name,
    },
  })
    .then((resp: any) => {
      if (key === 'image') {
        Object.assign(form, { image: convertFileSrc(resp.data) });
      }
      if (key === 'bg') {
        Object.assign(form, { bg: convertFileSrc(resp.data) });
      }
    })
    .catch((e) => {
      console.log(e);
    })
    .finally(() => {
      if (key === 'image') {
        imageLoading.value = false;
      }
      if (key === 'bg') {
        bgLoading.value = false;
      }
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

<style lang="css"></style>
