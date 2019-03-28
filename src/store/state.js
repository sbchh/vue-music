// 状态管理 只保留最基础的数据
import { playMode } from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  // 全屏播放页
  fullScreen: false,
  // 当前已有的播放列表
  playlist: [],
  // 顺序当前播放列表
  sequenceList: [],
  mode: playMode.sequence,
  // 当前歌曲播放的索引
  currentIndex: -1,
  disc: {},
  topList: {}
}

export default state
