// 状态管理 只保留最基础的数据
import { playMode } from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  // 全屏播放页
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  // 当前歌曲播放的索引
  currentIndex: -1,
  disc: {}
}

export default state
