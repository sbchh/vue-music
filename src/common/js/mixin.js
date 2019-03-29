// 通用组件接口 只定义方法 不定义具体操作 方便复用组件

import { mapGetters, mapMutations } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  // 钩子函数 组件到__触发的事件
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  // click-alive组件触发的事件
  activated () {
    this.handlePlaylist(this.playlist)
  },
  // 处理方法
  methods: {
    handlePlaylist () {
      throw new Error('compnonent must implement handlePlaylist method')
    }
  },
  // 观察得到数据的变化
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  }
}

export const playerMixin = {
  computed: {
    // 改变图标样式
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode'
    ])
  },
  methods: {
    // 改变播放模式
    changeMode () {
      const mode = (this.mode + 1) % 3
      // 更改播放模式图标
      this.setPlayMode(mode)
      // 初始化播放器列表
      let list = null
      // 如果是随机播放 将列表变成随机列表
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 将变化后的列表传入播放器中
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    // 在传入变化后的播放列表时 当前歌曲不变化(index不变化)
    resetCurrentIndex (list) {
      // 在新的list里找到当前歌曲对应的索引
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    })
  }
}
