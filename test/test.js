// 模拟您的请求函数
function makeRequest(index) {
  console.log('Making request', index);
  // 这里可以是您的实际请求逻辑，返回一个Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Request', index, 'completed');
      resolve();
    }, 1000); // 这里模拟请求花费的时间，您需要根据实际情况调整
  });
}

async function sendRequests() {
  const maxConcurrency = 6;
  const totalRequests = 100;

  const requestPromises = [];

  for (let i = 1; i <= totalRequests; i += maxConcurrency) {
    const batchPromises = [];
    for (let j = 0; j < maxConcurrency && i + j <= totalRequests; j++) {
      batchPromises.push(makeRequest(i + j));
    }
    const finishedPromise = await Promise.race(batchPromises);
    requestPromises.push(finishedPromise);
  }

  // 等待所有请求完成
  await Promise.all(requestPromises);
}

sendRequests();
