import axios from 'axios';


const instance = axios.create({
    baseURL: 'http://127.0.0.1:8080/',
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


export { listMedia,getMediaByID }