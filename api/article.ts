import request from '~~/api/request'
export const getArticleList = (data: any) => {
  return request.post('/article/list', data)
}
export const getArticleInfo = (params: any) => {
  // console.log(params.id)
  if (!params.id) {
    return
  }
  return request.get('/article/info', params)
}

export const createArticle = (data: any) => {
  return request.post('/article/create', data)
}

// 更新阅读量
export const updateViews = (data: any) => {
  return request.post('/article/views', data)
}

// 更新点赞数
export const updateLikes = (data: any) => {
  return request.post('/like', data)
}

// 必应每日一图
export const dailyImage = (n?: number) => {
  return request.get('/resources/daily-img', { n, })
}

// 获取文章归档
export const getArchives = () => {
  return request.get('/article/archives')
}

// 获取文章评论
export const getComment = (id: string) => {
  return request.get('/comment/findAll', { articleId: id, })
}
// 新增评论
export const addComment = (data: any) => {
  return request.post('/comment/create', data)
}
// 删除评论
export const delComment = (id: string) => {
  return request.del('/comment/delete', { id, })
}

// 新增回复
export const addReply = (data: any) => {
  return request.post('/reply/create', data)
}
// 删除回复
export const delReply = (id: string) => {
  return request.del('/reply/delete', { id, })
}
