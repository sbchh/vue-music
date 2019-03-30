// 状态管理 只保留最基础的数据
import { playMode } from 'common/js/config'
import { loadSearch, loadPlay, loadFavorite } from 'common/js/catch'

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
  // 推荐歌单详情页
  disc: {},
  // 排行榜详情页
  topList: {},
  // 搜索历史
  searchHistory: loadSearch(),
  // 播放历史
  playHistory: loadPlay(),
  // 收藏列表
  favoriteList: loadFavorite()
}

export default state
