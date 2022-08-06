import * as article from "./article";
import * as tag from "./tag";
import * as category from "./category";
import request from "~~/api/request.js";

// 获取用户信息
const getUserInfo = async ():Promise<userInfoState> => {
  const { data } = await request.get("/user/info");
  const { nickname, homepage, intro, avatar } = data;
  return {
    nickname,
    homepage,
    intro,
    avatar,
  };
};
const api = {
  ...article,
  ...tag,
  ...category,
  getUserInfo,
};
export default api;
