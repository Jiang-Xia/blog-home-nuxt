import { useToast } from "tailvue";
export const messageDanger = (msg: string,timeout:number = 1) => {
  if (process.client) {
    const $toast = useToast();
    $toast.show({
      type: "danger",
      timeout,
      message: msg,
    });
  }
};
export const messageSuccess = (msg: string = "",timeout:number = 1) => {
  if (process.client) {
    const $toast = useToast();
    $toast.show({
      type: "success",
      timeout,
      message: msg,
    });
  }
};

