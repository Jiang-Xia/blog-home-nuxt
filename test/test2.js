const timeOut = (item, time = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(item)
    }, time)
  })
}
const timeOut2 = (item, time = 1000) => {
  return item
}
const dataArr = [1, 2, 3, 4, 5]

const forofTest = async () => {
  for (const item of dataArr) {
    const res = await timeOut(item)
    console.log(res)
  }
}
// forofTest() // 同步依次输出 1 2 3 4 5
// 数组就是一个可迭代对象
const asyncIterable = [timeOut(2, 2000), timeOut(3, 5000), timeOut(1, 10000)]
const forAwaitOfTest = async () => {
  // 异步迭代
  for await (const item of asyncIterable) {
    console.log(asyncIterable)
    console.log(item)
  }
}
forAwaitOfTest() // 同步依次输出 2 3 1
