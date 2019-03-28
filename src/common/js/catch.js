// 操作与本地缓存相关的逻辑
import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

// 收藏列表
// 歌单列表

// 保存搜索结果列表
export function saveSearch (query) {
  // 搜索列表数组 最多有15条数据
  // 如果有重复的数据则替换到最新的搜索结果中
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  // 保存记录
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 插入所得结果到数组中 比较arr与compare(先前的arr)的值
function insertArray (arr, val, compare, maxLen) {
  let index = arr.findIndex(compare)
  // 如果是第一条数据 不需比较
  if (index === 0) {
    return
  }
  // 如果有且非第一个 先删除arr对应元素
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 再插到第一个位置
  arr.unshift(val)
  // 如果arr的长度大于最大长度 把最后一个元素去掉
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 从本地缓存读取searchList
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}

// 删除一条搜索结果
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 从数组中删除元素
function deleteFromArray (arr, compare) {
  let index = arr.findIndex(compare)
  // 如果元素存在 删除一个元素
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 清空搜索结果
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}
