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
    <div class="p-24">
      <div class="flex-row" style="justify-content: space-between">
        <a-space>
          <span class="font-16-600">媒体库路径：{{ workPath }}</span>
        </a-space>
        <a-space>
          <a-button type="primary" @click="onSave">保存</a-button>
        </a-space>
      </div>
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="类型" name="title">
              <a-radio-group v-model:value="form.type" button-style="solid">
                <a-radio-button value="movies">电影</a-radio-button>
                <a-radio-button value="tvs">电视剧</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="文件类型" name="title">
              <a-radio-group v-model:value="form.file_type" button-style="solid">
                <a-radio-button value=".mp4">MP4</a-radio-button>
                <a-radio-button value=".m3u8">M3U8</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="名称" name="title">
              <a-input v-model:value="form.title" placeholder="请输入资源名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="剧集" name="title">
              <div class="flex-row mb-8" style="align-items: center" v-for="(item, index) in form.vods" :key="index">
                <span class="font-16-600" style="width: 40px">{{ item.index }}:</span>
                <a-form-item-rest>
                  <a-input v-model:value="item.title" placeholder="请输入资源名称" />
                </a-form-item-rest>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">
import { reactive, watch } from 'vue';
import m3u8Downloader, { M3u8DownTask } from '../../utils/m3u8_helper';
import { settingStore } from '../../utils/store';
import { invoke } from '@tauri-apps/api/tauri';
import { message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
  info: VideoInfo;
}>();

interface Vod {
  title: string;
  url: string;
  index: number;
  tv_name: string;
  movie_name: string;
}

interface FormData {
  id: number;
  title: string;
  type: string;
  file_type: string;
  vods: Vod[];
}

const form = reactive<FormData>({
  id: 0,
  title: '',
  type: 'movies',
  file_type: '.mp4',
  vods: [],
});

watch(props.info, (info) => {
  form.id = info.id;
  form.title = info.title.replaceAll(' ', '');
  if (info.episodes && info.episodes?.length > 1) {
    form.type = 'tvs';
  }
  form.vods.splice(0);
  info.episodes!.forEach((episode) => {
    //S01E01-异人之下.mp4
    let eStr = String(episode.index);
    if (episode.index < 10) {
      eStr = '0' + eStr;
    }
    form.vods.push({
      title: episode.title,
      tv_name: `S01E${eStr}-${form.title}`,
      movie_name: `${form.title}`,
      url: episode.url,
      index: episode.index,
    });
  });
});

const emit = defineEmits(['update:visible']);
const onClose = () => {
  emit('update:visible', false);
};
const workPath = settingStore.get('media_path') || null;
// invoke('handle_create_dir', { path: workPath + '\\tvs' }).then((resp: any) => {});
// invoke('handle_create_dir', { path: workPath + '\\movies' }).then((resp: any) => {});

const onSave = () => {
  let root_path = workPath + '\\' + form.type + '\\' + form.title;
  invoke('handle_create_dir', { path: root_path }).then((resp: any) => {
    form.vods.forEach((vod) => {
      let task: M3u8DownTask = {
        uuid: form.id + '-' + vod.index,
        name: form.title + '-' + vod.title,
        url: vod.url,
        workPath: root_path,
        outputFilePath: root_path + '\\' + (form.type === 'tvs' ? vod.tv_name : vod.movie_name) + form.file_type,
      };
      m3u8Downloader.submitTask(task);
    });
    message.success('已加入下载队列，请前往下载中心查看');
  });
};
</script>
