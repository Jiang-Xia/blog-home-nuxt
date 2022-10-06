import request from '~~/api/request'
export const getTagById = async (id: number) => {
  const res = await request.get('/tag/' + id)
  return res.data
}
export const getAllTag = async () => {
  const res = await request.get('/tag', { isDelete: true, })
  return res.data
}
export const createTag = async (data: any) => {
  const res = await request.post('/tag', data)
  return res.data
}
