<template>
  <div class="full">
    <div class="bg full"></div>
    <div class="mask full"></div>
    <div class="flex-row info-box" style="padding: 30px 40px">
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
        <div class="desc ellips-6 font-14-400 c-c9c9c mt-12">
          <span class="c-999">剧情简介：</span>
          <span>
            {{ video.description }}
          </span>
        </div>
        <div class="episodes flex-row mt-24">
          <div class="episode-item" v-for="item in video.episodes" @click="playVideo(item)">
            <span class="font-14-400 c-000">{{ item.title }}</span>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="pic">
          <div class="mask1"></div>
          <img :src="video.image" alt="" srcset="" />
        </div>
      </div>
    </div>

    <!-- <div class="btn mt-12">
      <span class="font-16-600 c-000">Play Now</span>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { invoke } from '@tauri-apps/api/tauri';

const route = useRoute();
const router = useRouter()
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
    video.episodes = JSON.parse(video.episodes)
    console.log(video);

  });
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
  background: linear-gradient(90deg,
      rgba(1, 1, 1, 1),
      rgba(1, 1, 1, 0.9),
      rgba(1, 1, 1, 0.8),
      rgba(1, 1, 1, 0.7),
      rgba(1, 1, 1, 0.4),
      rgba(1, 1, 1, 0),
      rgba(1, 1, 1, 0));
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
      width: 260px;
      height: 390px;
      position: relative;

      img {
        width: 260px;
        height: 390px;
        border-radius: 4px;
      }

      .mask1 {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
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
  background: url('http://img5.mtime.cn/pi/2023/08/24/154656.63133360_1000X1000.jpg');
  background-repeat: space;
  background-position: center;
  background-size: auto 100%;
}

.c-c9c9c {
  color: #c9c9c9;
}
</style>
