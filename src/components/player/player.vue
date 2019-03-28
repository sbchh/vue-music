<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div @click="back" class="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" v-for="(line,index) in currentLyric.lines" :key="index"
                   :class="{'current':currentLineNum===index}" class="text">
                  {{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prevSong" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="nextSong" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div @click="openList" class="mini-player" v-show="!fullScreen">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop.prevent="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" @play="Songready" @error="Songerror" @timeupdate="updateTime" @ended="Songend"
           :src="currentSong.url"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters, mapMutations } from 'vuex'
  import animations from 'create-keyframe-animation'
  import { prefixStyle } from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import { playMode } from 'common/js/config'
  import { shuffle } from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    data () {
      return {
        // 当前歌曲是否准备播放
        songReady: false,
        // 当前音乐时长
        currentTime: 0,
        // mini进度条半径
        radius: 32,
        // 当前歌曲歌词
        currentLyric: null,
        // 当前歌词所在的行->对应的是歌词数组的下标
        currentLineNum: 0,
        // 播放器当前页
        currentShow: 'cd',
        // 播放时歌词
        playingLyric: ''
      }
    },
    computed: {
      // 返回播放/暂停按钮
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      iconMode () {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      // 旋转的CD样式
      cdCls () {
        return this.playing ? 'play' : 'play pause'
      },
      disableCls () {
        return this.songReady ? '' : 'disable'
      },
      // 计算播放比例 已播放时长/总时长
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      // 通过播放列表是否存在来控制播放器的显示与否
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    created () {
      // 添加touch事件
      this.touch = {}
    },
    methods: {
      back () {
        this.setFullScreen(false)
      },
      openList () {
        this.setFullScreen(true)
      },
      enter (el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter () {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      // 获取专辑图片的位置
      _getPosAndScale () {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        // 负号表示小图标到大图标的方向
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      // 控制歌曲播放
      togglePlaying () {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        // 如果歌曲正在播放 歌词滚动
        // 反之 歌词停止滚动
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      prevSong () {
        if (!this.songReady) {
          return
        }
        // 如果列表只有一首歌
        if (this.playlist.length === 1) {
          this.loopSong()
          return
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      // 播放下一首(附加:考虑只有一首歌的情况)
      nextSong () {
        if (!this.songReady) {
          return
        }
        // 如果列表只有一首歌
        if (this.playlist.length === 1) {
          this.loopSong()
          return
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          // 点击自动播放下一首歌曲
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      loopSong () {
        // 将当前进度条重置为0
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        this.setPlayingState(true)
        if (this.currentLyric) {
          // 重置歌词到最初
          this.currentLyric.seek(0)
        }
      },
      Songready () {
        this.songReady = true
      },
      Songerror () {
        this.songReady = true
      },
      Songend () {
        // 如果当前是循环播放
        if (this.mode === playMode.loop) {
          this.loopSong()
        } else {
          this.nextSong()
        }
      },
      updateTime (e) {
        // 获取当前播放时间
        this.currentTime = e.target.currentTime
      },
      formatTime (interval) {
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      // 获取歌词并解析 (排除没有歌词的情况)
      _getLyric () {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          // 歌曲正在播放
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      // 歌词每一行发生改变时 滚动并高亮 同时 CD页的歌词也滚动显示
      handleLyric ({lineNum, txt}) {
        this.currentLineNum = lineNum
        // 保证歌词显示在屏幕的中间
        // 歌词五行内不滚动 之后一行一行滚动
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      // 点击事件
      middleTouchStart (e) {
        this.touch.initiated = true
        const touched = e.touches[0]
        this.touch.startX = touched.pageX
        this.touch.startY = touched.pageY
      },
      // 左右滑动 切换歌词和cd界面
      middleTouchMove (e) {
        if (!this.touch.initiated) {
          return
        }
        const touched = e.touches[0]
        const deltaX = touched.pageX - this.touch.startX
        const deltaY = touched.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // 修改歌词页的界面位置
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        // 修改CD页高斯模糊
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      // 点击事件结束
      middleTouchEnd () {
        let offsetWidth = 0
        let offsetOpacity = 0
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            // 当往左移动10%的距离 将歌词页面放在页面中间
            offsetWidth = -window.innerWidth
            offsetOpacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            offsetOpacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            // 当往右移动10%的距离 将歌词页面放在页面中间
            offsetWidth = 0
            offsetOpacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            offsetOpacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = offsetOpacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      // 播放时 进度条补0
      _pad (num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      // 滑动进度条事件 传入percent
      onProgressBarChange (percent) {
        const currentSongTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentSongTime
        // 歌曲暂停播放时 歌词也暂停滚动
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentSongTime * 1000)
        }
      },
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
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlaylist: 'SET_PLAYLIST'
      })
    },
    watch: {
      currentSong (newSong, oldSong) {
        if (!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) {
          return
        }
        // 防止歌词来回闪动
        // 在切歌之前 先把当前的歌词滚动给关掉
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        // 保证从后台切换到前台 歌曲可以重新播放
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          // 获取歌词
          this._getLyric()
        }, 300)
      },
      // 观察歌曲播放状态
      playing (newPlaying) {
        const audio = this.$refs.audio

        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transitionDuration: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-cd
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-wechat-black
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-mi-gray
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
