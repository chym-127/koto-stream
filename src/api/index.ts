import axios from 'axios';
import { message } from 'ant-design-vue';
import { settingStore } from '../utils/store';

const baseURL = settingStore.get('api_base_url') || ''
const instance = axios.create({
    baseURL: baseURL,
    timeout: 60 * 1000,
    headers: { 'Content-Type': 'application/json' }
});


instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response.data.code !== 200) {
        message.warning(response.data.message)
        return Promise.reject(response.data);
    }
    return response.data;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

const listMedia = (data: any) => {
    return instance.post('list/media', data)
}

const getMediaByID = (data: any) => {
    return instance.post('get/media', data)
}


const downMediaByID = (data: any) => {
    return instance.post('down/media', data)
}

const listDownTask = (data: any = {}) => {
    return instance.post('list/task', data)
}


const updateMediaApi = (data: any) => {
    return instance.post('update/media', data)
}


const updateAllMediaMetaApi = (data: any = {}) => {
    return instance.post('update/medias/from-disk', data)
}

const downAllMediaNotLocal = (data: any = {}) => {
    return instance.post('down/media/nolocal', data)
}

export { listMedia, getMediaByID, downMediaByID, listDownTask, updateMediaApi, updateAllMediaMetaApi, downAllMediaNotLocal }
