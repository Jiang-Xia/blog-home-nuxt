import request from '~~/api/request'
export const getTagById = (id: number) => {
  return request.get('/tag/' + id)
}
export const getAllTag = () => {
  return request.get('/tag', { isDelete: true, })
}
export const createTag = (data: any) => {
  return request.post('/tag', data)
}
