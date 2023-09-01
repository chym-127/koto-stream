<template>
  <div class="tip-confirm">
    <div class="content-box">
      <div class="left flex-row">上次播放至 ,是否继续播放</div>
      <div class="right flex-row">
        <div class="action-btn">
          <span>{{ okTxt }}</span>
        </div>
        <div class="action-btn">
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

const newTipConfirm = (data: any) => {
  context.value = data.context;
  okTxt.value = data.okTxt || '是';
  cancelTxt.value = data.cancelTxt || '否';
  leftTime.value = data.leftTime || 3;
  tipName.value = data.tipName || '';
};

const tipsEnd = (event:string) => {
  let msg: EventMsg = {
    id: 'tips-confirm-event',
    name: 'tips事件',
    data: {
        tipName: tipName.value,
        event: event
    },
  };
  eventBus.publicize(msg);
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
