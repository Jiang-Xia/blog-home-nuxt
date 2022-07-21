import request from '~~/api/request'
export const getCategoryById = async (id: number) => {
  const res = await request.get('/category/' + id)
  return res.data
}
export const getAllCategory = async () => {
  const res = await request.get('/category')
  return res.data
}
export const createCategory = async (data: any) => {
  const res = await request.post('/category',data)
  return res.data
}
