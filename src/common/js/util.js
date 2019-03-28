// 工具类

// 打乱播放列表顺序
export function shuffle (arr) {
  // 创建arr的副本 不影响原数据
  let _arr = arr.slice()
  let len = _arr.length
  for (let i = 0; i < len; i++) {
    // 随意交换数组下标
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 截流函数 -> 对函数进行延时后调用
export function debounce (func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
