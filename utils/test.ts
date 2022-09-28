// 测试泛型
// function test (num: number): number {
//   return num
// }
function identity<T> (value: T): T {
  return value
}
console.log(identity<Number>(1)) // 1

function identity2<T, U> (value: T, message: U): T {
  console.log(message)
  return value
}

console.log(identity2<Number, string>(68, 'Semlinker'))

function identity3<T, U> (value: T, message: U): T {
  console.log(message)
  return value
}

console.log(identity3(68, 'Semlinker'))

// function identity4<T, U> (value: T, message: U): [T, U] {
//   return [value, message]
// }

interface Identities<V, M> {
  value: V;
  message: M;
}

function identity5<T, U> (value: T, message: U): Identities<T, U> {
  console.log(value + ': ' + typeof value)
  console.log(message + ': ' + typeof message)
  const identities: Identities<T, U> = {
    value,
    message,
  }
  return identities
}

console.log(identity5(68, 'Semlinker'))
