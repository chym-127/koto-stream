<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { onMounted, ref } from 'vue';
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import { useRoute } from 'vue-router';

let url = ref('');
let currentOpacity = ref(0);
let currentOpacityIndex = 0;
const route = useRoute()
let m3u8_url = route.query.url

let opacitys = [0, 0.2, 0.4, 0.6, 0.8, 1];
let videoInstance: any = null;
let hls: any = null;
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
    hls.loadSource(m3u8_url);
  }
  videoInstance.setAttribute('crossorigin', 'anonymous');
});

function opacitysChange() {
  let len = opacitys.length;
  if (currentOpacityIndex === len - 1) {
    currentOpacityIndex = 0;
  } else {
    currentOpacityIndex += 1;
  }
  currentOpacity.value = opacitys[currentOpacityIndex];
}

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
  <div class="full" data-tauri-drag-region>
    <div class="mask" data-tauri-drag-region :style="{ opacity: currentOpacity }"></div>

    <video data-tauri-drag-region id="videoInstance" autoplay controls
      controlslist="nodownload nofullscreen noremoteplayback" height="360" width="200" preload="auto" data-setup="{}"
      class="video-box"></video>
  </div>
</template>

<style scoped>
.mask {
  position: fixed;
  background-color: #000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.video-box {
  width: 100%;
  height: 100%;
}

.btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
}
</style>
