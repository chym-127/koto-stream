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
  console.log(id);
  
  let el = document.getElementById(id)
  console.log(el);
  
  if (el) {
    return el
  }
  return document.body
}

export { holdResponse, getElementById };
