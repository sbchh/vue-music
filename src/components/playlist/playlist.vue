<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text" @click="changeMode">{{modeText}}</span>
            <span class="clear" @click="showComfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll class="list-content" :data="sequenceList" ref="listContent" :refreshDelay="refreshDelay">
          <transition-group name="list" tag="ul">
            <li class="item" v-for="(item,index) in sequenceList" :key="item.id" @click="selectItem(item,index)"
                ref="listItem">
              <i class="current" :class="getCurrentIcon(item)" ref="currentIcon"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
              <i class="icon-not-favorite" :class="getFavoriteIcon(item)"></i>
            </span>
              <span class="delete" @click.stop="deleteOne(item)">
              <i class="icon-delete"></i>
            </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="showAddSong">
            <i class="icon-add"></i>
            <span class="text">添加到播放队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <comfirm ref="comfirm" @comfirm="comfirmClear" text="是否清空播放列表" comfirmBtnText="清空"></comfirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import { mapActions } from 'vuex'
  import { playMode } from 'common/js/config'
  import Scroll from 'base/scroll/scroll'
  import Comfirm from 'base/comfirm/comfirm'
  import { playerMixin } from 'common/js/mixin'
  import AddSong from 'components/add-song/add-song'

  export default {
    mixins: [playerMixin],
    data () {
      return {
        // 显示标志
        showFlag: false,
        // 重新设置刷新时间为100ms 保证动画加载完成后显示数据
        refreshDelay: 100
      }
    },
    computed: {
      // mapGetters的组件放在了mixins中引用
      modeText () {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
      }
    },
    methods: {
      // 显示播放列表 激活列表滚动事件并把当前歌曲放在列表首位
      show () {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      // 隐藏播放列表
      hide () {
        this.showFlag = false
      },
      // 设置当前播放列表当前歌曲的样式
      getCurrentIcon (item) {
        if (this.currentSong.id === item.id) {
          return 'icon-play'
        }
        return ''
      },
      // 选择播放对应歌曲
      selectItem (item, index) {
        // 如果是随机播放 将当前歌曲下标对应的随机播放下标找到
        if (this.mode === playMode.random) {
          index = this.playlist.findIndex((song) => {
            return song.id === item.id
          })
        }
        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },
      // 当前播放歌曲滚动到列表首位
      scrollToCurrent (current) {
        // 获取当前歌曲在顺序列表的id
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        // 界面定位到当前歌曲
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
      },
      // 删除播放列表中的歌曲
      deleteOne (item) {
        this.deleteSong(item)
        // 如果列表为空 隐藏列表界面
        if (!this.playlist.length) {
          this.hide()
        }
      },
      // 显示清空播放列表提示框
      showComfirm () {
        this.$refs.comfirm.show()
      },
      // 确认清空播放列表
      comfirmClear () {
        this.deleteSongList()
        this.hide()
      },
      // 显示添加到列表控件
      showAddSong () {
        this.$refs.addSong.show()
      },
      ...mapActions([
        'deleteSong',
        'deleteSongList'
      ])
    },
    watch: {
      currentSong (newSong, oldSong) {
        // 如果播放列表不显示或歌曲未变化
        if (!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        this.scrollToCurrent(newSong)
      }
    },
    components: {
      Scroll,
      Comfirm,
      AddSong
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-mi-yellow
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-mi-yellow
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
