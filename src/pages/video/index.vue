<template>
  <div class="full" style="position: relative">
    <div class="bg full" v-if="video.fanart_url">
      <img :src="bgPath" alt="" srcset="" style="width: 100%; height: 100%" />
    </div>
    <div class="bg full" v-else :style="{ backgroundImage: 'url(' + defaultBg + ')' }"></div>
    <div class="mask full"></div>
    <div class="flex-row info-box" style="padding: 30px 40px 30px 40px">
      <div class="left flex-1">
        <div class="ellips-1">
          <span class="title">{{ video.title }}</span>
          <span class="ml-16 font-28-600" style="color: #c6c6c6">({{ video.release_date }})</span>
        </div>
        <div class="c-fff font-16-400" v-if="video.score">
          <a-rate :count="1" v-model:value="value" />
          <span class="ml-4">{{ video.score!.toFixed(1) }}/10</span>
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
          <img v-if="video.poster_url" :src="getMediaLocalResouce(video, 'poster.jpg')" alt="" srcset="" />
        </div>
      </div>
    </div>
    <div style="padding: 0 40px 20px 40px; overflow: auto; height: 150px">
      <div class="episodes flex-row">
        <template v-for="(item, index) in video.episodes">
          <a-tooltip :mouseEnterDelay="0.3">
            <template #title>{{ item.description || '暂无简介' }}</template>
            <div class="episode-item" @click="playVideo(item.index)">
              <span class="font-14-400 c-000" v-if="video.type === 2">第{{ item.index }}集</span>
              <span class="font-14-400 c-000" v-if="video.type === 1">播放</span>
            </div>
          </a-tooltip>
        </template>
      </div>
    </div>

    <Setting
      v-model:visible="settingVisible"
      :style="{ position: 'absolute' }"
      ref="setting"
      :info="video"
      @update="updateSetting"
    ></Setting>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onUnmounted, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import defaultBg from '../../assets/image/bg.webp';
import Setting from './Setting.vue';
import store from '../../utils/store';
import { getMediaLocalResouce } from '../../utils/index';
import eventBus, { EventMsg } from '../../utils/event_bus';
import TipsConfirm from '../../utils/tips_confirm';
import playHistory, { RecentEpisodRecord } from './history';
import { downMediaByID, getMediaByID } from '../../api';

const settingVisible = ref<boolean>(false);

const route = useRoute();
const router = useRouter();
const value = ref(1);
const bgPath = ref('');

const video = reactive<VideoInfo>({
  id: 0,
  title: '',
});
const setting = ref<InstanceType<typeof Setting> | null>(null);

const showSetting = () => {
  settingVisible.value = !settingVisible.value;
  if (settingVisible.value) {
    setting.value?.resetInfo();
  }
};

const id = route.query.id || null;
let lastRecent: RecentEpisodRecord | null = null;

if (id) {
  handleGetVideo();
}
function handleGetVideo() {
  getMediaByID({ id: Number(id) }).then((resp: any) => {
    Object.assign(video, resp.data);
    bgPath.value = getMediaLocalResouce(video, 'fanart.jpg');
    if (video.episodes && video.episodes.length) {
      video.episodes!.forEach((episode) => {
        episode.description = episode.description?.replace(/ /g, '+').replace(/\n/g, '');
        if (episode.description && episode.description.length >= 256) {
          episode.description = episode.description.slice(0, 256) + '...';
        }
      });
    }
    video.play_config = video.play_config ? JSON.parse(resp.data.play_config) : null;

    video.full_name = `${video.title}(${video.release_date})`;

    if (video.type === 2) {
      lastRecent = playHistory.getRecentEpisod(video.full_name);
      if (lastRecent) {
        historyTips.newTipConfirm(`检测到上次播放到第${lastRecent.index}集，是否继续播放`, -1);
      }
    }
  });
}

function updateSetting() {
  message.success('更新成功');
  settingVisible.value = false;
  handleGetVideo();
}

function playVideo(index: number) {
  store.set('CURRENT_VIDEO', video, true);
  router.push({
    path: '/video/player',
    query: {
      index: index,
    },
  });
}

const setMenu = (menus: any) => {
  let msg: EventMsg = {
    id: 'set-custom-menu',
    name: '设置菜单',
    data: menus,
  };
  eventBus.publicize(msg);
};

const downloadAll = () => {
  downMediaByID({ id: video.id }).then((resp: any) => {
    message.success('已加入下载队列');
  });
};

let menus = [
  {
    id: 'UPDATE',
    name: '编辑视频',
    clickFunc: showSetting,
  },
  {
    id: 'DONWLOAD',
    name: '下载',
    clickFunc: downloadAll,
  },
];

const historyTips = new TipsConfirm(document.getElementById('content') as Element, {
  okCallback: () => {
    playVideo(lastRecent!.index - 1);
  },
  cancelCallback: () => {},
});

onMounted(() => {
  setMenu(menus);
});
onUnmounted(() => {
  setMenu([]);
  historyTips.destroy();
});
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
    width: 78px;
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
    rgba(1, 1, 1, 0.9),
    rgba(1, 1, 1, 0.9),
    rgba(1, 1, 1, 0.8),
    rgba(1, 1, 1, 0.8),
    rgba(1, 1, 1, 0.8),
    rgba(1, 1, 1, 0.5),
    rgba(1, 1, 1, 0)
  );
  opacity: 0.6;
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
      font-size: 42px;
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
      border: 1px solid #fff;
      width: 242px;
      height: 352px;
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
        opacity: 0.1;
      }
    }
  }
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-repeat: repeat-x;
  background-position: center;
  background-size: auto 100%;
}

.c-c9c9c {
  color: #c9c9c9;
}

.koto-btn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
