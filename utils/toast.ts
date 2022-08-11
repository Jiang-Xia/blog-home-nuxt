import { useToast } from "tailvue";
export const messageDanger = (msg: string) => {
  if (process.client) {
    const $toast = useToast();
    $toast.show({
      type: "danger",
      timeout: 1,
      message: msg,
    });
  }
};
export const messageSuccess = (msg: string) => {
  if (process.client) {
    const $toast = useToast();
    $toast.show({
      type: "success",
      timeout: 1,
      message: msg,
    });
  }
};

