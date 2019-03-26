// 异步操作/修改 或 对mutation做一些封装
// 定义修改的属性提交到mutation

import * as types from './mutation-types'
import { playMode } from '../common/js/config'
import { shuffle } from '../common/js/util'

// 选择歌曲播放
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 如果此时播放模式是随机
  // 1.打乱播放列表 2.把顺序列表歌曲的下标对应到新列表下标
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放全部
export const randomPlay = function ({commit}, {list}) {
  // 播放模式->随机
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  // 原列表变成随机列表
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 把顺序列表中某一首歌的下标对应到随机列表的下标
function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
