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
        <div class="episode-item" v-for="(e, index) in currentVideo.episodes" @click="playVideo(e, index)">
          <div class="card-box" :class="index === currentIndex ? 'active' : null">
            <span class="c-fff">{{ e.title }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="video-name">
      <!-- <span>{{ currentVideo.title }}-{{ currentEpisode?.title }}</span> -->
      <img :src="logoUrl" @error="" alt="" srcset="" style="height: 20px;">
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
      class="video-box"
    ></video>
  </div>
</template>

<script setup lang="ts">
import { LogicalSize, appWindow } from '@tauri-apps/api/window';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import { useRoute } from 'vue-router';
import Hls from 'hls.js';
import eventBus, { EventMsg } from '../../utils/event_bus';
import m3u8Downloader, { M3u8DownTask } from '../../utils/m3u8_helper';
import store from '../../utils/store';
import { message } from 'ant-design-vue';
import playHistory from '../video/history';
import appConfig from '../../utils/config';
import windowHelper, { WindowSize } from '../../utils/window_helper';
import TipsConfirm from '../../utils/tips_confirm';
import { getMediaLocalResouce } from '../../utils';

const url = ref('');
const totalDuration = ref(0);

const route = useRoute();
const currentVideo = reactive<VideoInfo>(store.get('CURRENT_VIDEO'));

let logoUrl = getMediaLocalResouce(currentVideo, 'logo.png')
let currentEpisode: Episode | undefined;
let videoPlayConfig: VideoPlayConfig | undefined;

let currentIndex = ref<number>(Number(route.query.index));
if (currentVideo) {
  currentEpisode = currentVideo.episodes?.find((item, index) => {
    return index === currentIndex.value;
  });
  videoPlayConfig = currentVideo.expand;
}
let videoInstance: any = null;
let hls: Hls | null = null;

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
};

const downloadToLocal = () => {
  if (!currentEpisode?.file_path) {
    onDown(currentEpisode!);
  } else {
    message.warning('当前视频已下载到本地');
  }
};

const playListModalVisible = ref(false);
const togglePlayListModal = () => {
  playListModalVisible.value = !playListModalVisible.value;
};
let menus = [
  {
    id: 'DONWLOAD',
    name: '下载到本地',
    clickFunc: downloadToLocal,
  },
  {
    id: 'PLAY_LIST',
    name: '播放列表',
    clickFunc: togglePlayListModal,
  },
];

let workPath = '';
invoke('handle_get_work_path', {}).then((resp: any) => {
  workPath = resp.data;
  setMenu(menus);
});
const onDown = (e: Episode) => {
  let task: M3u8DownTask = {
    uuid: currentVideo.id + '-' + e.index,
    name: currentVideo.title + '-' + e.title,
    url: e.url,
    workPath: workPath + '\\' + currentVideo.id,
    outputFilePath: workPath + '\\' + currentVideo.id + '\\' + e.index + '.mp4',
  };
  m3u8Downloader.submitTask(task);
};

onUnmounted(() => {
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
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      console.log('video and hls.js are now bound together !');
    });
    hls.on(Hls.Events.MANIFEST_PARSED, function (event: any, data: any) {
      console.log(event, data);
      console.log('manifest loaded, found ' + data.levels.length + ' quality level');
    });
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
  hls!.loadSource(currentEpisode.url);
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
let isMinimize = ref(false);
unregisterAll();
register('CommandOrControl+D', async () => {
  if (!isMinimize.value) {
    await appWindow.minimize();
    isMinimize.value = true;
  } else {
    await appWindow.unminimize();
    isMinimize.value = false;
  }
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
const toggleWindowSize = async () => {
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
  playHistory.set(currentVideo.id, currentEpisode!.index, progress);
  progressState = progress;
}

function checkHasHistory() {
  let data = playHistory.get(currentVideo.id, currentEpisode!.index);
  if (data && data.progress) {
    progress.value = data.progress;
    progressStr.value = new Date(data.progress * 1000).toISOString().slice(11, 19);
    historyTips.newTipConfirm(`上次播放至 ${progressStr.value},是否继续播放`, 10);
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
</style>
