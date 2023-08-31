import { message } from 'ant-design-vue';

interface Resp {
  data: [];
  message: string;
  code: Number;
}

function holdResponse(resp: Resp) {
  if (resp.code === 200) {
    return true;
  } else {
    message.error(resp.message);
    return false;
  }
}


function getElementById(id: string): HTMLElement {
  let el = document.getElementById(id)
  if (el) {
    return el
  }
  return document.body
}


const formatSeconds = (seconds: number, format: string = 'HHMMSS') => {
  // eslint-disable-next-line no-debugger
  // debugger;
  let hasHour = format.indexOf('HH') !== -1;
  let hasMinutes = format.indexOf('MM') !== -1;
  let hasSecond = format.indexOf('SS') !== -1;
  let temp = '';
  let sec: number = seconds <= 0 ? 1 : Number(seconds.toFixed(0));
  let h: number = 0, m: number = 0, s: number = 0, unit: number = 0;

  unit = 60 * 60;
  if (hasHour) {
    h = Math.trunc((sec / unit));
    if (h) {
      sec = sec % unit;
    }
  }

  unit = 60;
  if (hasMinutes) {
    m = Math.trunc((sec / unit));
    if (m) {
      sec = sec % unit;
    }
  } else {
    sec > 0 && h!++;
  }

  if (hasSecond) {
    s = sec;
  } else {
    sec > 0 && hasMinutes && m!++;
  }

  if (m! >= 60) {
    m = 0;
    h!++;
  }

  if (hasHour && Number(h)) {
    temp += `${h}小时`;
  }

  if (hasMinutes && Number(m)) {
    temp += `${m}分钟`;
  }

  if (hasSecond && Number(s)) {
    temp += `${s}秒`;
  }

  return temp;
};

export { holdResponse, getElementById, formatSeconds };
