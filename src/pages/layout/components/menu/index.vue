<template>
  <div class="menu-list p-12">
    <div class="menu-item flex items-center active">
      <router-link to="/">
        <span>Home</span>
      </router-link>
    </div>
  </div>
</template>
<script setup lang="ts"></script>

<style lang="less" scoped>
.menu-item {
  height: 40px;
  cursor: pointer;
  justify-content: center;
  border-radius: 8px;
}

.menu-item.active {
  background-color: #e6f2fe;
  color: #4281e7;
}
</style>
