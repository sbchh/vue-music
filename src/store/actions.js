// 异步操作/修改 或 对mutation做一些封装
// 定义修改的属性提交到mutation

import * as types from './mutation-types'
import { playMode } from '../common/js/config'
import { shuffle } from '../common/js/util'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/catch'

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

// 把顺序列表中某一首歌的下标对应到随机列表的下标
function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
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

// 添加一首歌曲到已有的歌曲列表中
export const insertSong = function ({commit, state}, song) {
  // 添加歌曲 实质上是对state的已有播放歌曲列表、顺序当前播放列表和当前歌曲索引进行相应修改
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 判断待插入歌曲是否在已有的播放列表下 返回其索引
  let fpIndex = findIndex(playlist, song)
  // 插入歌曲 故索引+1
  currentIndex++
  // 插入索引到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果包含这首待插入的歌 删除列表中的这首歌
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号 删除前者
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // 将待插入的歌曲插入到顺序播放列表中
  // 获取当前歌曲应该插入到顺序列表中的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索历史记录到本地
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除搜索历史记录到本地
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空搜索历史记录到本地
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 删除播放列表中的歌曲
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndenx = findIndex(sequenceList, song)
  sequenceList.splice(sIndenx, 1)
  // 如果当前歌曲索引大于被删除歌曲索引 且删除的是最后一首歌
  // 反之保持currentIndex不变 因为不会影响当前歌曲的索引位置
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  // 提交修改后的状态
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  // 如果删光了播放列表 则歌曲不播放
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}

// 清空播放列表
export const deleteSongList = function ({commit}) {
  // 提交空数组到列表
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

// 保存播放历史
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 保存收藏记录
export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 删除收藏记录
export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
