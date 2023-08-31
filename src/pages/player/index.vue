<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { onMounted, onUnmounted, ref } from 'vue';
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import { useRoute } from 'vue-router';
import Hls from 'hls.js';
import eventBus, { EventMsg } from '../../utils/event_bus';
import m3u8Downloader, { M3u8DownTask } from '../../utils/m3u8_helper';
import store from '../../utils/store';

let url = ref('');
const route = useRoute();
const currentVideo: VideoInfo = store.get('CURRENT_VIDEO');

let currentEpisode: Episode | undefined;
let index: number = Number(route.query.index);
if (currentVideo) {
  currentEpisode = currentVideo.episodes?.find((item) => {
    return item.index === index;
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
const downloadToLocal = () => {
  onDown(currentEpisode!);
};
let menus = [
  !file_path && {
    id: 'DONWLOAD',
    name: '下载到本地',
    clickFunc: downloadToLocal,
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
register('CommandOrControl+D', () => {
  if (!isMinimize.value) {
    appWindow.minimize();
    isMinimize.value = true;
  } else {
    appWindow.unminimize();
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

<template>
  <div class="full">
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

<style scoped>
.video-box {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
}
</style>
