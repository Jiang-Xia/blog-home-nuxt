import request from '~~/api/request'
export const getCategoryById = (id: number) => {
  return request.get('/category/' + id)
}
export const getAllCategory = () => {
  return request.get('/category', { isDelete: true, })
}
export const createCategory = (data: any) => {
  return request.post('/category', data)
}
