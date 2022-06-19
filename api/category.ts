import request from '@/utils/request'
export const getCategoryById = async (id: number) => {
  const res = await request({
    url: '/category/' + id,
    method: 'get'
  })
  return res.data
}
export const getAllCategory = async () => {
  const res = await request({
    url: '/category',
    method: 'get'
  })
  return res.data
}
export const createCategory = async (data: any) => {
  const res = await request({
    url: '/category',
    method: 'post',
    data
  })
  return res.data
}
export const updateCategory = async (data: any) => {
  const res = await request({
    url: '/category',
    method: 'patch',
    data
  })
  return res.data
}
export const delCategory = async (id: number) => {
  const res = await request({
    url: '/category/' + id,
    method: 'delete'
  })
  return res.data
}
