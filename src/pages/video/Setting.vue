<template>
  <a-drawer
    title="设置"
    :width="720"
    @afterVisibleChange="afterVisibleChange"
    :visible="props.visible"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
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
              <a-button type="primary" style="width: 100px" @click="saveToLocal(form.bg!)">下载到本地</a-button>
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
    <template #extra>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script lang="ts" setup>
import { invoke } from '@tauri-apps/api/tauri';
import { reactive, toRaw } from 'vue';
import { Form } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
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

const rules: Record<string, Rule[]> = {
  title: [{ required: true, message: '请输入名称' }],
};

const useForm = Form.useForm;

const { resetFields, validate, validateInfos, clearValidate } = useForm(form, rules, {
  onValidate: (...args) => console.log(...args),
});
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

const afterVisibleChange = (visible: boolean) => {
  if (visible) {
    Object.assign(form, props.info);
  }
};

function handleUpdateVideo(data: VideoInfo) {
  let resq = {
    ...data,
    episodes: JSON.stringify(data.episodes),
  };
  console.log(resq);

  invoke('handle_update_video', {
    t: resq,
  }).then((resp: any) => {
    emit('update');
  });
}

function saveToLocal(url: string) {
  invoke('handle_file_to_local', {
    t: {},
  }).then((resp: any) => {});
}
</script>
