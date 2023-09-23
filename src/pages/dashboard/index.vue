<template>
  <div class="full vod-list container">
    <div class="vod-item" v-for="(item, index) in items" :key="index" @click="jumpToDetails(item)">
      <div class="pic">
        <img :src="item.poster_url" alt="" srcset="" loading="lazy"/>
      </div>
      <div class="info mt-4 c-000 ellips-2" style="word-break: break-all">
        <span class="font-14-600">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { listMedia } from '../../api/index';
import { getMediaLocalResouce } from '../../utils';
const router = useRouter();
let items = reactive<VideoInfo[]>([]);
let currentPoster = ref('');

function handleListVideo() {
  items.splice(0);
  listMedia({}).then((resp) => {
    Object.assign(items, resp.data);
    for (let index = 0; index < items.length; index++) {
      const video = items[index];
      if (video.poster_url) {
        video.poster_url = getMediaLocalResouce(video, 'poster.jpg');
      }
    }
  });
}

function jumpToDetails(row: any) {
  router.push({
    path: '/video',
    query: {
      id: row.id,
    },
  });
}

function mouseenter(event: any, item: VideoInfo) {
  let localUrl = getMediaLocalResouce(item, 'fanart.jpg');
  if (localUrl) {
    currentPoster.value = localUrl;
  }
}

function mouseleave(event: any, item: VideoInfo) {}
handleListVideo();
</script>

<style lang="less" scoped>
.show-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 6px;
}

.container {
  -ms-overflow-style: none;
  /* Internet Explorer 10+ */
  scrollbar-width: none;
  /* Firefox */
}

.container::-webkit-scrollbar {
  display: none;
  /* Safari and Chrome */
}

.container {
  overflow: auto;
  display: flex;
  background-color: transparent;
  flex-wrap: wrap;
  padding: 10px 10px;
}

.container > .vod-item {
  width: 210px;
  height: 300px;
  padding: 20px 20px 0 20px;
  cursor: pointer;

  .pic {
    border-radius: 12px;
    width: 170px;
    height: 220px;

    img {
      border-radius: 12px;
      width: 170px;
      height: 220px;
    }
  }
}
</style>
