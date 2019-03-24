/**
 * 更改 Vuex 的 store 中的状态
 * 类似于事件
 * 每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。
 */

import * as types from './mutation-types'

const matutaions = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  }
}

export default matutaions
