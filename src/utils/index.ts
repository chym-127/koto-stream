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

export { holdResponse };
