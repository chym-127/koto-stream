<template>
  <div class="full vod-list container">

    <button @click="showModal" class="show-btn">Import</button>
    <a-modal v-model:visible="open" title="导入媒体数据" @ok="handleOk">
      <textarea v-model="content" id="" cols="30" rows="10" class="full"></textarea>
    </a-modal>

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
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';

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
    resp.data.forEach((item: any) => {
      item.episodes = JSON.parse(item.episodes)
    });
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


const open = ref<boolean>(false);
const content = ref('');
function showModal() {
  open.value = true;
}

function handleOk() {
  let data = null
  try {
    data = JSON.parse(content.value);
  } catch (error) {
    message.error("JSON格式错误")
    return
  }


  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const item = data[key];
      item["episodes"] = JSON.stringify(item["episodes"])

      invoke('handle_create_video', {
        t: item,
      }).then((resp: any) => {
        message.success("导入成功")
        handleListVideo()
      });
    }
  }
}
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
  padding-bottom: 20px;
  background-color: #0e0f11;
  flex-wrap: wrap;
}

.container>.vod-item {
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
