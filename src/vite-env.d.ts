/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const ejs;
// declare const Hls;
declare const __TAURI__;
declare module 'uuid';
declare module 'lodash.clonedeep';
declare const videojs;
