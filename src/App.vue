<script setup lang="ts">
import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/tauri';
import DefaultLayout from './pages/layout/index.vue';

</script>

<template>
  <div class="w-screen h-screen">
    
    <DefaultLayout></DefaultLayout>
  </div>
</template>

<style lang="less" scoped>

</style>
