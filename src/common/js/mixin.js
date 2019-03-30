// 通用组件接口 只定义方法 不定义具体操作 方便复用组件

import { mapGetters, mapMutations, mapActions } from 'vuex'
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
      'mode',
      'favoriteList'
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
    // 根据当前歌曲设置收藏图标
    getFavoriteIcon (song) {
      if (this._isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    // 切换收藏图标状态
    toggleFavorite (song) {
      if (this._isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    // 判断是否为收藏
    _isFavorite (song) {
      const index = this.favoriteList.findIndex((item) => {
        return song.id === item.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data () {
    return {
      // 待搜索字段
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 添加热门词到搜索框中
    addQuery (newQuery) {
      this.$refs.searchBox.setQuery(newQuery)
    },
    // 当searchBox发生变化时
    onQueryChange (newQuery) {
      // 从搜索框里拿到变化值
      this.query = newQuery
    },
    // 清除输入框状态 滑动无输入法遮挡
    blurInput () {
      this.$refs.searchBox.blur()
    },
    // 保存搜索历史
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
