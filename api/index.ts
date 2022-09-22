import * as article from './article'
import * as tag from './tag'
import * as category from './category'
import request from '~~/api/request.js'

// 获取用户信息
const getUserInfo = async (): Promise<userInfoState> => {
  const { data = {}, } = await request.get('/user/info')
  const { nickname, homepage, intro, avatar, id: uid, } = data
  return {
    nickname,
    homepage,
    intro,
    avatar,
    uid,
  }
}
const api = {
  ...article,
  ...tag,
  ...category,
  getUserInfo,
}
// https://gitee.com/api/v5/repos/jiang-xia/blog-home-nuxt/commits?access_token=53db1802db341bf994093cace04c275b&page=1&per_page=20
export default api
