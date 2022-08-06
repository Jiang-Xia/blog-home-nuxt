import { baseUrl } from "~~/config";

const errorResponse: ApiResponse = {
  success: false,
  code: 0,
  message: "",
  data: null,
};

// 获取 token
const getToken = () => {
  const tk = useToken();
  let token = "";
  if (tk.value) {
    token = "Bearer " + tk.value;
  }
  // console.log({ token });
  return token;
};
const get = async (url: string, params = {}): Promise<ApiResponse> => {
  try {
    const res = await $fetch<ApiResponse>(baseUrl + url, {
      headers: {
        Authorization: getToken(),
      },
      method: "GET",
      params: params,
    });
    return res;
  } catch (error: any) {
    errorResponse.message = error;
    return errorResponse;
  }
};

const post = async (url: string, params = {}): Promise<ApiResponse> => {
  try {
    const res = await $fetch<ApiResponse>(baseUrl + url, {
      headers: {
        // "Accept": "application/json, text/plain, */*",
        // "Content-Type": "application/json",
        Authorization: getToken(),
      },
      method: "POST",
      body: params,
    });
    return res;
  } catch (error: any) {
    errorResponse.message = error;
    return errorResponse;
  }
};

const put = async (url: string, params = {}): Promise<ApiResponse> => {
  try {
    const res = await $fetch<ApiResponse>(baseUrl + url, {
      headers: {
        // "Accept": "application/json, text/plain, */*",
        // "Content-Type": "application/json",
        Authorization: getToken(),
      },
      method: "PUT",
      body: params,
    });
    return res;
  } catch (error: any) {
    errorResponse.message = error;
    return errorResponse;
  }
};

export default { get, post, put };
