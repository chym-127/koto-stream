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
        <div class="episode-item" v-for="(e, index) in currentVideo.episodes" @click="playVideo(e)">
          <div class="card-box" :class="e.index === currentIndex ? 'active' : null">
            <span class="c-fff">{{ e.title }}</span>
          </div>
        </div>
      </div>
    </div>
    <video
      id="videoInstance"
      autoplay
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
import { open } from '@tauri-apps/api/dialog';
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

let url = ref('');
const route = useRoute();
const currentVideo = reactive<VideoInfo>(store.get('CURRENT_VIDEO'));

let currentEpisode: Episode | undefined;
let currentIndex = ref<number>(Number(route.query.index));
if (currentVideo) {
  currentEpisode = currentVideo.episodes?.find((item) => {
    return item.index === currentIndex.value;
  });
}
let m3u8_url: string = currentEpisode!.url;
let file_path: any = currentEpisode?.file_path;
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
  toggleWindowSize()
});

onMounted(() => {
  videoInstance = document.getElementById('videoInstance');
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
    if (file_path) {
      url.value = convertFileSrc(file_path);
      videoInstance.src = url.value;
    } else {
      hls.loadSource(m3u8_url);
    }
  }
  videoInstance.setAttribute('crossorigin', 'anonymous');
});

const playVideo = (e: Episode) => {
  currentEpisode = e;
  currentIndex.value = e.index;
  if (currentEpisode.file_path) {
    url.value = convertFileSrc(currentEpisode.file_path);
    videoInstance.src = url.value;
  } else {
    hls!.loadSource(currentEpisode.url);
  }
};

async function openFile() {
  const selected: any = await open({
    multiple: false,
    filters: [
      {
        name: 'Videos',
        extensions: ['mp4'],
      },
    ],
  });
  if (selected !== null) {
    url.value = convertFileSrc(selected);
    videoInstance.src = url.value;
    // hls.loadSource(url.value);
  }
}

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

register('CommandOrControl+Shift+S', () => {
  openFile();
});

register('CommandOrControl+Shift+M', () => {
  toggleWindowSize();
});

const toggleWindowSize = async () => {
  const size = await appWindow.outerSize();
  if (size.width === 1080) {
    toggleMenuBar(false);
    await appWindow.setAlwaysOnTop(true);
    await appWindow.setSize(new LogicalSize(360, 214));
  } else {
    toggleMenuBar(true);
    await appWindow.setAlwaysOnTop(false);
    await appWindow.setSize(new LogicalSize(1080, 640));
  }
};

const initWindow = async () => {
  const size = await appWindow.outerSize();
  if (size.width === 360) {
    toggleMenuBar(false);
    await appWindow.setAlwaysOnTop(true);
  }
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

function seekVideo(second: number) {
  if (videoInstance) {
    videoInstance.currentTime += second;
  }
}
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
</style>
