<template>
  <div class="full" style="position: relative">
    <div
      class="mask"
      v-if="playListModalVisible"
      style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: transparent; z-index: 2"
      @click="togglePlayListModal"
    ></div>

    <div class="episode-list" :class="playListModalVisible ? 'show' : 'hide'">
      <div class="flex-row" style="flex-wrap: wrap">
        <template v-for="(item, index) in currentVideo.episodes">
          <a-tooltip :mouseEnterDelay="0.8">
            <template #title>{{ item.description || '暂无简介' }}</template>
            <div class="episode-item" @click="playVideo(item, index)">
              <div class="card-box" :class="item.index === currentIndex ? 'active' : null">
                <span class="c-fff">{{ item.index }}</span>
              </div>
            </div>
          </a-tooltip>
        </template>
      </div>
    </div>
    <div class="video-name" v-if="currentVideo.type === 2">
      <!-- <span>{{ currentVideo.title }}-{{ currentEpisode?.title }}</span> -->
      <img :src="logoUrl" @error="" alt="" srcset="" style="height: 20px" />
    </div>
    <video
      id="videoInstance"
      autoplay
      @click.prevent="playOrPause()"
      controls
      controlslist="nodownload nofullscreen noremoteplayback"
      height="100%"
      width="100%"
      preload="auto"
      data-setup="{}"
      class="video-box mask"
    ></video>
    <div class="mask" v-if="hasMask"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import { useRoute } from 'vue-router';
import Hls from 'hls.js';
import eventBus, { EventMsg } from '../../utils/event_bus';
import store, { settingStore } from '../../utils/store';
import playHistory from '../video/history';
import appConfig from '../../utils/config';
import windowHelper, { WindowSize } from '../../utils/window_helper';
import TipsConfirm from '../../utils/tips_confirm';
import { getMediaLocalResouce } from '../../utils';
import extractAds, { AdsRange } from '../../utils/ad_skip';

const hasMask = ref(settingStore.get('play_mask') || false);
const totalDuration = ref(0);
const route = useRoute();
const currentVideo = reactive<VideoInfo>(store.get('CURRENT_VIDEO'));
currentVideo.full_name = `${currentVideo.title}(${currentVideo.release_date})`;
let logoUrl = getMediaLocalResouce(currentVideo, 'logo.png');
let currentEpisode: Episode | undefined;
let videoPlayConfig: VideoPlayConfig | undefined;

let currentIndex = ref<number>(Number(route.query.index));
let currentSeason = ref<number>(Number(route.query.season || 1));
if (currentVideo) {
  currentEpisode = currentVideo.episodes?.find((item, index) => {
    return item.index === currentIndex.value && item.season === currentSeason.value;
  });
  videoPlayConfig = currentVideo.play_config;
}
let videoInstance: any = null;
let hls: Hls | null = null;
let ads: AdsRange[] = [];

const setMenu = (menus: any) => {
  let msg: EventMsg = {
    id: 'set-custom-menu',
    name: '设置菜单',
    data: menus,
  };
  eventBus.publicize(msg);
};

const toggleMenuBar = (visible: boolean) => {
  let msg: EventMsg = {
    id: 'toggle-menu-bar',
    name: '切换菜单的显示和隐藏',
    data: visible,
  };
  eventBus.publicize(msg);
  setMenu(menus);
};

const playListModalVisible = ref(false);
const togglePlayListModal = () => {
  playListModalVisible.value = !playListModalVisible.value;
};
let menus = [
  {
    id: 'PLAY_LIST',
    name: '播放列表',
    clickFunc: togglePlayListModal,
  },
];

setMenu(menus);

let timeId = setTimeout(() => {
  store.set(
    'LAST_VIDEO',
    {
      id: currentVideo.id,
      e_season: currentSeason.value,
      e_index: currentEpisode?.index,
    },
    true
  );
}, 1000 * 30);
onUnmounted(() => {
  clearTimeout(timeId);
  setMenu([]);
  restoreWindow();
  historyTips.destroy();
  videoInstance.removeEventListener('timeupdate', timeupdate);
  videoInstance = null;
});

function timeupdate() {
  if (videoInstance && videoInstance.currentTime) {
    if (videoInstance.currentTime - progressState > 2) {
      addHistory(videoInstance.currentTime);
    }
    if (videoPlayConfig?.auto_skip && totalDuration) {
      let t = videoPlayConfig.end_duration;
      let diff = totalDuration.value - videoInstance.currentTime;
      if (diff <= t) {
        playNextVideo();
      }
    }
    ads.forEach((range) => {
      if (range.startSec <= videoInstance.currentTime && videoInstance.currentTime <= range.endSec) {
        seekVideo(range.sec);
      }
    });
  }
}

onMounted(() => {
  videoInstance = document.getElementById('videoInstance');
  videoInstance.addEventListener('timeupdate', timeupdate, false);
  videoInstance.addEventListener('loadedmetadata', () => {
    totalDuration.value = videoInstance.duration;
  });

  if (Hls.isSupported()) {
    hls = new Hls();
    // hls = new Hls({
    //   loader: TauriLoader,
    // });
    // bind them together
    hls.attachMedia(videoInstance);
    playVideo(currentEpisode!, currentIndex.value);
  }
  videoInstance.setAttribute('crossorigin', 'anonymous');
});

const playVideo = (e: Episode, index: number) => {
  progressState = 0;
  currentEpisode = e;
  currentIndex.value = index;
  let localPath = '';
  if (currentEpisode.local_path) {
    if (currentVideo.type == 2) {
      localPath = `Season-${currentEpisode.season}\\${currentEpisode.local_path}`;
      localPath = getMediaLocalResouce(currentVideo, localPath);
    } else {
      localPath = getMediaLocalResouce(currentVideo, currentEpisode.local_path, false);
    }
  }
  if (localPath && localPath.indexOf('.mp4') !== -1) {
    videoInstance.src = localPath;
  } else {
    extractAds(currentEpisode.url).then((resp: any) => {
      ads = resp as AdsRange[];
    });
    hls!.loadSource(currentEpisode.url);
  }

  if (videoPlayConfig?.start_duration) {
    videoInstance.currentTime = videoPlayConfig!.start_duration;
  }
  checkHasHistory();

  if (windowHelper.currentWindowSize === WindowSize.MINI && playListModalVisible) {
    playListModalVisible.value = false;
  }
};

const playNextVideo = () => {
  let newIndex = currentIndex.value + 1;
  if (newIndex >= currentVideo.episodes!.length) {
    return;
  }
  totalDuration.value = 999999999;
  let e = currentVideo.episodes![currentIndex.value + 1];
  playVideo(e, newIndex);
};

// 全局快捷键
unregisterAll();
register('CommandOrControl+D', async () => {
  windowHelper.toggleMinimize();
});

register('CommandOrControl+E', () => {
  seekVideo(10);
});

register('CommandOrControl+Q', () => {
  seekVideo(-10);
});

register('CommandOrControl+W', () => {
  playOrPause();
});

register('CommandOrControl+Shift+M', () => {
  toggleWindowSize();
});

register('CommandOrControl+Shift+F', () => {
  windowHelper.maxScreen();
});

//窗口逻辑
//切换窗口大小
const toggleWindowSize = async (init: boolean = false) => {
  if (windowHelper.currentWindowSize === WindowSize.MINI) {
    toggleMenuBar(true);
    await windowHelper.alwaysOnTop(false);
    await windowHelper.normalScreen();
  } else if (windowHelper.currentWindowSize === WindowSize.NORMAL) {
    toggleMenuBar(false);
    await windowHelper.alwaysOnTop(true);
    await windowHelper.miniScreen();
  }
};

//检查窗口size
const initWindow = async () => {
  if (appConfig.playPageAutoMini) {
    await windowHelper.miniScreen();
  }

  if (windowHelper.currentWindowSize === WindowSize.MINI) {
    toggleMenuBar(false);
  }
  await windowHelper.alwaysOnTop(true);
};
function SSEMsgCallBack(msg: { name: string; data: any }) {
  if (msg.name === 'IRREMOTE') {
    switch (msg.data) {
      //前进
      case 'C43FF00':
        seekVideo(10);
        break;
      //后退
      case 'B44FF00':
        seekVideo(-10);
        break;
      case 'F40FF00':
        playOrPause()
        break;
      default:
        break;
    }
  }
}

eventBus.on('SSE-MSG', SSEMsgCallBack);

onUnmounted(() => {
  eventBus.off('SSE-MSG', SSEMsgCallBack);
});
//恢复窗口状态
const restoreWindow = async () => {
  if (windowHelper.currentWindowSize === WindowSize.MINI) {
    toggleMenuBar(true);
    await windowHelper.normalScreen();
  }
  await windowHelper.alwaysOnTop(false);
};

initWindow();

const isVideoPlaying = (video: any) =>
  !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

function playOrPause() {
  if (!videoInstance) {
    return;
  }
  if (isVideoPlaying(videoInstance)) {
    videoInstance.pause();
  } else {
    videoInstance.play();
  }
}

function seekVideo(second: number, flag: boolean = false) {
  if (videoInstance) {
    if (flag) {
      videoInstance.currentTime = second;
    } else {
      videoInstance.currentTime += second;
    }
  }
}

//播放记录相关逻辑
const progressStr = ref('');
const progress = ref(0);
const historyTips = new TipsConfirm(document.getElementById('content') as Element, {
  okCallback: () => {
    clickHistoryTips(progress.value);
  },
  cancelCallback: () => {},
});

let progressState = 0;
function addHistory(progress: number) {
  playHistory.set(currentVideo.full_name!, `${currentEpisode!.season}-${currentEpisode!.index}`, progress);
  progressState = progress;
}

function checkHasHistory() {
  let data = playHistory.get(currentVideo.full_name!, `${currentEpisode!.season}-${currentEpisode!.index}`);
  if (data && data.progress) {
    progress.value = data.progress;
    progressStr.value = new Date(data.progress * 1000).toISOString().slice(11, 19);
    historyTips.newTipConfirm(`上次播放至 ${progressStr.value},是否继续播放`, 20);
  }
}

const clickHistoryTips = (second: number) => {
  seekVideo(second, true);
};
</script>
<style lang="less" scoped>
.video-box {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: black;
}

.episode-list {
  width: 360px;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  z-index: 3;
  position: absolute;
  justify-content: flex-start;
  align-items: flex-start;
  padding-right: 10px;
  padding-bottom: 10px;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  transition: right 0.6s;
  box-sizing: border-box;

  &.hide {
    right: -360px;
  }

  &.show {
    right: 0;
  }

  .episode-item {
    height: 40px;
    cursor: pointer;
    padding: 10px 0 0 10px;
    width: 87.5px;

    .card-box {
      padding: 4px 0;
      height: 100%;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 8px;

      &.active {
        background-color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

.btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
}

.history-tips {
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
  font-size: 12px;
  color: #a0a0a0;
}

.video-name {
  position: absolute;
  top: 2px;
  left: 4px;
  opacity: 0.3s;
  font-size: 6px;
  color: #ffffff33;
}

.mask {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
