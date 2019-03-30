<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches @switch="switchItem" :switches="switches" :currentIndex="currentIndex"></switches>
      </div>
      <div class="play-btn" ref="playBtn" @click="randomPlayAll">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll class="list-scroll" v-if="currentIndex===0" :data="favoriteList" ref="favorList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll class="list-scroll" v-if="currentIndex===1" :data="playHistory" ref="playList">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import { mapGetters, mapActions } from 'vuex'
  import { playlistMixin } from 'common/js/mixin'
  import NoResult from 'base/no-result/no-result'

  export default {
    mixins: [playlistMixin],
    data () {
      return {
        currentIndex: 0,
        switches: [
          {name: '我的收藏'},
          {name: '最近播放'}
        ]
      }
    },
    computed: {
      // 判断页面是否为空 非空返回0 空返回1
      noResult () {
        if (this.currentIndex === 0) {
          return !this.favoriteList.length
        } else {
          return !this.playHistory.length
        }
      },
      // 根据页面类型返回不同空界面提示信息
      noResultDesc () {
        if (this.currentIndex === 0) {
          return '暂无收藏歌曲'
        } else {
          return '空空如也~ 快去听歌吧'
        }
      },
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    methods: {
      // 适配playlistMixin底部区域
      handlePlaylist (playlist) {
        const bottom = playlist.length ? '60px' : ''
        this.$refs.listWrapper.style.bottom = bottom
        // 根据不同页面进行相应滚动刷新
        this.$refs.favorList && this.$refs.favorList.refresh()
        this.$refs.playList && this.$refs.playList.refresh()
      },
      // 切换标签的下标
      switchItem (index) {
        this.currentIndex = index
      },
      // 返回首页
      back () {
        this.$router.back()
      },
      // 点击最近播放中的歌曲 插入到播放列表中
      selectSong (song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
        }
      },
      // 随机播放全部
      randomPlayAll () {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        // 如果列表皆空 不操作
        if (list.length === 0) {
          return
        }
        // 将列表每一项转换成歌曲类 用以播放器调用
        list = list.map((song) => {
          return new Song(song)
        })
        this.randomPlay({list})
      },
      ...mapActions([
        'insertSong',
        'randomPlay'
      ])
    },
    components: {
      Switches,
      Scroll,
      SongList,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
