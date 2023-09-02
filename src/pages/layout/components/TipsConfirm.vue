<template>
  <div class="tip-confirm">
    <div class="content-box" v-if="visible">
      <div class="left flex-row">{{ context }}</div>
      <div class="right flex-row">
        <div class="action-btn" @click="tipsEnd('ok')">
          <span>{{ okTxt }}</span>
          <span>({{ countDown }}s)</span>
        </div>
        <div class="action-btn" @click="tipsEnd('cancel')">
          <span>{{ cancelTxt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import eventBus, { EventMsg } from '../../../utils/event_bus';


const okTxt = ref('是');
const cancelTxt = ref('否');
const context = ref('');
const leftTime = ref(3);
const tipName = ref('');
const visible = ref(false)
const countDown = ref(0)

let scheduledId: any = null
let timerId: any = null

const newTipConfirm = (data: Tips | null) => {
  if (!data) {
    visible.value = false
    clearTimer()
    return
  }
  visible.value = true
  context.value = data!.context;
  okTxt.value = data!.okTxt || '是';
  cancelTxt.value = data!.cancelTxt || '否';
  leftTime.value = data!.leftTime || 3;
  countDown.value = leftTime.value
  tipName.value = data!.tipName || '';
  if (scheduledId) {
    clearTimeout(scheduledId)
    timerId && clearInterval(timerId)
  }
  scheduledId = setTimeout(() => {
    tipsEnd('ok')
  }, leftTime.value * 1000);
  timerId = setInterval(() => {
    countDown.value -= 1
  }, 1000)

};

const clearTimer = () => {
  if (scheduledId) {
    clearTimeout(scheduledId)
    timerId && clearInterval(timerId)
  }
}


const tipsEnd = (event: string) => {
  visible.value = false
  let msg: EventMsg = {
    id: 'tips-confirm-event',
    name: 'tips事件',
    data: {
      tipName: tipName.value,
      event: event
    },
  };
  eventBus.publicize(msg);
  clearTimer()
};

eventBus.on('new-tips-confirm', newTipConfirm);

onUnmounted(() => {
  eventBus.off('new-tips-confirm', newTipConfirm);
});
</script>

<style lang="less" scoped>
.tip-confirm {
  top: 0;
  left: 0;
  right: 0;

  .content-box {
    display: flex;
    padding: 5px 4px;
    justify-content: space-between;
    height: 32px;
    background-color: rgba(0, 0, 0, 0.4);

    .left {
      font-size: 12px;
      padding-left: 10px;
      justify-content: center;
      color: #a0a0a0;
    }

    .right {
      .action-btn {
        min-width: 20px;
        text-align: center;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        margin: 0 4px;
        padding: 0 4px;
        color: #666;
        font-size: 8px;
        line-height: 22px;

        &:hover {
          background-color: rgba(255, 255, 255, 1);
          color: #000;
        }
      }
    }
  }
}
</style>
