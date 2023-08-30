<template>
  <div class="full">
    <div class="bg full" :style="{ backgroundImage: 'url(' + video.bg + ')' }"></div>
    <div class="mask full"></div>
    <button class="koto-btn" @click="settingVisible = true">Setting</button>
    <div class="flex-row info-box" style="padding: 50px 40px 30px 40px">
      <div class="left flex-1">
        <div class="title ellips-1">
          <span>{{ video.title }}</span>
        </div>
        <div class="c-fff font-16-400">
          <a-rate :count="1" v-model:value="value" />
          <span class="ml-4">{{ video.score }}/10</span>

          <span class="ml-16">{{ video.release_date }}</span>
        </div>
        <div class="ellips-3 font-14-400 c-c9c9c mt-12">
          <span class="c-999">导演：</span>
          <span>{{ video.director }}</span>
        </div>
        <div class="ellips-1 font-14-400 c-c9c9c mt-12">
          <span class="c-999">主演：</span>
          <span>{{ video.actor }}</span>
        </div>
        <div class="desc ellips-8 font-14-400 c-c9c9c mt-12">
          <span class="c-999">剧情简介：</span>
          <span>
            {{ video.description }}
          </span>
        </div>
      </div>
      <div class="right">
        <div class="pic">
          <div class="mask1"></div>
          <img :src="video.image" alt="" srcset="" />
        </div>
      </div>
    </div>
    <div style="padding: 0 40px">
      <div class="episodes flex-row">
        <div class="episode-item" v-for="item in video.episodes" @click="playVideo(item)">
          <span class="font-14-400 c-000">{{ item.title }}</span>
        </div>
      </div>
    </div>

    <Setting v-model:visible="settingVisible" :info="video" @update="updateSetting"></Setting>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { invoke } from '@tauri-apps/api/tauri';
import { message } from 'ant-design-vue';

import Setting from './Setting.vue';

const settingVisible = ref<boolean>(false);
const route = useRoute();
const router = useRouter();
const value = ref(1);
const video = reactive<any>({});

const id = route.query.id || null;
if (id) {
  handleGetVideo();
}
function handleGetVideo() {
  invoke('handle_get_video', {
    id: Number(id),
  }).then((resp: any) => {
    Object.assign(video, resp.data);
    video.episodes = JSON.parse(video.episodes);
  });
}

function updateSetting() {
  message.success('更新成功');
  settingVisible.value = false;
  handleGetVideo();
}

function playVideo(item: any) {
  router.push({
    path: '/video/player',
    query: {
      url: item.url,
    },
  });
}
</script>

<style lang="less" scoped>
.btn {
  position: absolute;
  bottom: 60px;
  margin-left: 40px;
  padding: 12px;
  width: 120px;
  height: 40px;
  cursor: pointer;
  border-radius: 16px;
  margin-top: 20px;
  text-align: center;
  background-color: #fff;
  line-height: 1;
  z-index: 4;
}

.episodes {
  flex-wrap: wrap;
  position: relative;
  z-index: 4;
  .episode-item {
    width: 100px;
    height: 32px;
    cursor: pointer;
    border-radius: 16px;
    margin-bottom: 12px;
    text-align: center;
    background-color: #fff;
    line-height: 32px;
    margin-right: 12px;
  }
}

.mask {
  position: absolute;
  background: linear-gradient(
    90deg,
    rgba(1, 1, 1, 1),
    rgba(1, 1, 1, 0.9),
    rgba(1, 1, 1, 0.8),
    rgba(1, 1, 1, 0.7),
    rgba(1, 1, 1, 0.4),
    rgba(1, 1, 1, 0),
    rgba(1, 1, 1, 0)
  );
  opacity: 0.7;
  top: 0;
  left: 0;
  z-index: 2;
}

.info-box {
  justify-content: space-between;

  //   position: relative;
  .left {
    z-index: 3;
    position: relative;
    width: 450px;
    color: #fff;

    .title {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 10px;
    }

    .desc {
      word-break: break-all;
    }
  }

  .right {
    width: 300px;
    z-index: 1;
    position: relative;
    display: flex;
    justify-content: end;
    padding-top: 10px;
    height: auto;

    .pic {
      width: 240px;
      height: 350px;
      position: relative;
      border-radius: 8px;

      img {
        width: 240px;
        height: 350px;
        border-radius: 8px;
      }

      .mask1 {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        border-radius: 8px;
        opacity: 0.3;
      }
    }
  }
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-repeat: space;
  background-position: center;
  background-size: auto 100%;
}

.c-c9c9c {
  color: #c9c9c9;
}

.koto-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
