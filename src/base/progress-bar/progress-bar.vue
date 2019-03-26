<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress">
        <div class="progress-btn-wrapper" ref="progressBtn"
             @touchstart.prevent="progressTouchStart"
             @touchmove.prevent="progressTouchMove"
             @touchend="progressTouchEnd">
          <div class="progress-btn"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { prefixStyle } from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      // 进度条百分比
      percent: {
        type: Number,
        default: 0
      }
    },
    created () {
      this.touch = {}
    },
    methods: {
      // e为event->事件
      // 进度条开始前移 设置滑块可移动并记录相应的位置
      progressTouchStart (e) {
        // 初始化滑块可移动
        this.touch.initiated = true
        // 记录当前点击的位置
        this.touch.startX = e.touches[0].pageX
        // 记录进度条已走过的宽度
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove (e) {
        if (!this.touch.initiated) {
          return
        }
        // 算出移动了多少距离
        const deltaX = e.touches[0].pageX - this.touch.startX
        // 获取手指移动后的进度条已走的长度
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      // 进度条已走到最后 不可移动滑块
      progressTouchEnd () {
        this.touch.initiated = false
        this._triggerPercent()
      },
      // 进度条点击交互
      progressClick (e) {
        // 利用PageX与左边界的BoundingClientRect的值进行对比获取
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left - progressBtnWidth / 2
        this._offset(offsetWidth)
        this._triggerPercent(e.offsetX)
      },
      // 滑动滑块或点击进度条后 修改进度条所在位置
      _triggerPercent () {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / barWidth
        // 基础组件仅派发事件 不具体指向功能
        // 拖动完成 派发percent改变的事件 并把percent派发出去
        this.$emit('percentChange', percent)
      },
      // 设置进度条的偏移量
      _offset (offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      }
    },
    watch: {
      // 通过计算出播放的比例 改变已播放小球的位置和生成时间进度条
      percent (newPercent) {
        // 为防止拖动时进度条状态不一致(播放时的进度与拖动的进度不一致)
        if (newPercent >= 0 && !this.touch.initiated) {
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = newPercent * barWidth
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
