<template>
  <div class="full vod-list container">
    <div class="vod-item" v-for="(item, index) in items" :key="index" @click="jumpToDetails(item)">
      <div class="pic">
        <img :src="item.image" alt="" srcset="" />
      </div>
      <div class="info mt-4 c-fff">
        <span class="font-14-400">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { invoke } from '@tauri-apps/api/tauri';
import { reactive } from 'vue';

const router = useRouter();
let items = reactive<any>([]);
function handleListVideo() {
  invoke('handle_list_video', {
    req: {
      page_size: 10,
      page_num: 1,
    },
  }).then((resp: any) => {
    items.splice(0);
    Object.assign(items, resp.data);
  });
}

handleListVideo();

function jumpToDetails(row: any) {
  router.push({
    path: '/video',
    query: {
      id: row.id,
    },
  });
}
</script>

<style lang="less" scoped>
.container {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}
.container::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
.container {
  overflow: auto;
  display: flex;
  padding-bottom: 20px;
  background-color: #0e0f11;
  flex-wrap: wrap;
}

.container > .vod-item {
  width: 360px;
  //   height: 240px;
  padding: 20px 20px 0 20px;
  cursor: pointer;
  .pic {
    border-radius: 12px;
    width: 320px;
    height: 180px;
    img {
      border-radius: 12px;
      width: 320px;
      height: 180px;
    }
  }
}
</style>
