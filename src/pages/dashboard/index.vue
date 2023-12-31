<template>
  <div style="position: relative; overflow: hidden">
    <div class="flex flex-row" style="position: absolute; width: 100vw; height: 90px; padding: 24px 100px">
      <a-select v-model:value="listReqForm.type" @change="onSearch" size="large">
        <a-select-option :value="0">全部</a-select-option>
        <a-select-option :value="1">电影</a-select-option>
        <a-select-option :value="2">电视剧</a-select-option>
      </a-select>
      <a-input-search
        placeholder="按照剧名搜索"
        style="margin-left: 12px"
        v-model:value="listReqForm.keywords"
        size="large"
        @search="onSearch"
      >
        <a-button slot="enterButton">搜索</a-button>
      </a-input-search>
    </div>
    <div class="full vod-list container" style="margin-top: 90px; overflow: auto; height: calc(640px - 122px)">
      <div class="vod-item" v-for="(item, index) in items" :key="index">
        <div class="pic" @click="jumpToDetails(item)">
          <img :src="item.poster_url" alt="" srcset="" loading="lazy" />
        </div>
        <div class="info mt-4 c-000 ellips-2" style="word-break: break-all">
          <span class="font-14-600">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onUnmounted, reactive, ref } from 'vue';
import { getMediaByID, listMedia } from '../../api/index';
import { getMediaLocalResouce } from '../../utils';
import eventBus, { EventMsg } from '../../utils/event_bus';
import store from '../../utils/store';
const router = useRouter();
let items = reactive<VideoInfo[]>([]);

interface ListReq {
  keywords: string;
  current: number;
  page_limit: number;
  type: number;
}

interface LastMedia {
  id: number;
  e_index: number;
}

const setMenu = (menus: any) => {
  let msg: EventMsg = {
    id: 'set-custom-menu',
    name: '设置菜单',
    data: menus,
  };
  eventBus.publicize(msg);
};

let lastVideo = store.get('LAST_VIDEO') || null;
let video: VideoInfo = {
  id: 0,
  title: '',
};
if (lastVideo && lastVideo.id) {
  getMediaByID({ id: lastVideo.id }).then((resp: any) => {
    Object.assign(video, resp.data);
    if (video.episodes && video.episodes.length) {
      video.episodes!.forEach((episode) => {
        episode.description = episode.description?.replace(/ /g, '+').replace(/\n/g, '');
        if (episode.description && episode.description.length >= 256) {
          episode.description = episode.description.slice(0, 256) + '...';
        }
      });
    }
    setMenu([
      {
        id: 'PLAY_LAST_VIDEO',
        name: `继续播放：${video.title} ${lastVideo.e_season}-${lastVideo.e_index}`,
        clickFunc: playLastMedia,
      },
    ]);
  });
}

onUnmounted(() => {
  setMenu([]);
});

function playLastMedia() {
  store.set('CURRENT_VIDEO', video, true);
  router.push({
    path: '/video/player',
    query: {
      index: lastVideo.e_index,
      season: lastVideo.e_season,
    },
  });
}

const listReqForm = reactive<ListReq>({
  keywords: '',
  current: 1,
  page_limit: 20,
  type: 0,
});

function handleListVideo() {
  listMedia(listReqForm).then((resp) => {
    if (listReqForm.current === 1) {
      items.splice(0);
    }
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

function onSearch() {
  listReqForm.current = 1;
  handleListVideo();
}

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
  height: 260px;
  padding: 20px 20px 0 20px;

  .pic {
    cursor: pointer;
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
