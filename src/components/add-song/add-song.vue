<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="shortcut-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll class="list-scroll" v-if="currentIndex===0" :data="playHistory" ref="songList"
                  :refreshDelay="refreshDelay">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll class="list-scroll" v-if="currentIndex===1" :data="searchHistory" ref="searchList"
                  :refreshDelay="refreshDelay">
            <div class="list-inner">
              <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest"
                 @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">已添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import { searchMixin } from 'common/js/mixin'
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import { mapGetters, mapActions } from 'vuex'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import SearchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'

  export default {
    mixins: [searchMixin],
    data () {
      return {
        // 显示标志
        showFlag: false,
        // 不显示歌手
        showSinger: false,
        // 当前歌曲下标
        currentIndex: 0,
        // 顶部标签文字
        switches: [
          {name: '最近播放'},
          {name: '搜索历史'}
        ]
      }
    },
    computed: {
      ...mapGetters([
        'playHistory',
        'searchHistory'
      ])
    },
    methods: {
      // 派发显示添加到列表事件
      show () {
        this.showFlag = true
        setTimeout(() => {
          if (!this.currentIndex) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchList.refresh()
          }
        })
      },
      // 派发隐藏添加到列表事件
      hide () {
        this.showFlag = false
      },
      // 保存搜索结果
      selectSuggest () {
        this.saveSearch()
        this.showTip()
      },
      // 上滑取消输入状态
      blurInputAdd () {
        this.blurInput()
      },
      // 设置标签点击事件
      switchItem (index) {
        this.currentIndex = index
      },
      // 点击最近播放中的歌曲 插入到播放列表中
      selectSong (song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
          this.showTip()
        }
      },
      // 显示顶部标签 两秒后隐藏
      showTip () {
        this.$refs.topTip.show()
      },
      ...mapActions([
        'insertSong'
      ])
    },
    components: {
      SearchBox,
      Suggest,
      Switches,
      Scroll,
      SongList,
      SearchList,
      TopTip
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .shortcut-wrapper
      margin: 20px
    .shortcut
      margin: 10px
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
