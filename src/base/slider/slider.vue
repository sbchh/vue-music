<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key='index'
            :class="{active:currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type='text/ecmascript-6'>
  import BScroll from 'better-scroll'
  import { addClass } from 'common/js/dom'

  export default {
    name: 'slider',
    data () {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    // 轮播图循环设置
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 3000
      }
    },
    // mounted钩子函数中可以获取真实DOM
    mounted () {
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
        // 判断自动播放
        if (this.autoPlay) {
          this._play()
        }
      }, 20)

      // 监听窗口大小改变事件
      window.addEventListener('resize', () => {
        if (!this.slider || !this.slider.enabled) {
          return
        }
        clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(() => {
          if (this.slider.isInTransition) {
            this._onScrollEnd()
          } else {
            if (this.autoPlay) {
              this._play()
            }
          }
          this.refresh()
        }, 60)
      })
    },
    activated () {
      this.slider.enable()
      let pageIndex = this.slider.getCurrentPage().pageX
      this.slider.goToPage(pageIndex, 0, 0)
      this.currentPageIndex = pageIndex
      if (this.autoPlay) {
        this._play()
      }
    },
    deactivated () {
      this.slider.disable()
      clearTimeout(this.timer)
    },
    beforeDestroy () {
      this.slider.disable()
      clearTimeout(this.timer)
    },
    methods: {
      refresh () {
        if (this.slider) {
          this._setSliderWidth(true)
          this.slider.refresh()
        }
      },
      _setSliderWidth (isResize) {
        this.children = this.$refs.sliderGroup.children

        // 设置轮播图宽度
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          // 添加样式
          addClass(child, 'slider-item')

          // 添加宽度
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }

        if (this.loop && !isResize) {
          // 左右加宽两个dom 保证可以循环切换
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      // 初始化dot数组 在轮播图之前
      _initDots () {
        this.dots = new Array(this.children.length)
      },
      // 初始化Slider
      _initSlider () {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: {
            loop: this.loop,
            threshold: 0.3,
            speed: 400
          }
        })

        // 绑定事件
        this.slider.on('scrollEnd', this._onScrollEnd)
        this.slider.on('touchend', () => {
          if (this.autoPlay) {
            this._play()
          }
        })

        this.slider.on('beforeScrollStart', () => {
          if (this.autoPlay) {
            clearTimeout(this.timer)
          }
        })
      },
      _onScrollEnd () {
        let pageIndex = this.slider.getCurrentPage().pageX
        this.currentPageIndex = pageIndex
        if (this.autoPlay) {
          this._play()
        }
      },
      // 初始化自动滚动
      _play () {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.slider.next()
        }, this.interval)
      }
    },
    // 清除计时器缓存
    destroyed () {
      clearTimeout(this.timer)
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider {
    min-height: 1px;
    position: relative;
    .slider-group {
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      .slider-item {
        float: left;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
        a {
          display: block;
          width: 100%;
          overflow: hidden;
          text-decoration: none;
        }
        img {
          display: block;
          width: 100%;
        }
      }
    }
    .dots {
      position: absolute;
      right: 0;
      left: 0;
      bottom: 12px;
      transform: translateZ(1px)
      text-align: center;
      font-size: 0;
      .dot {
        display: inline-block;
        margin: 0 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: white;
        &.active {
          width: 20px;
          border-radius: 5px;
          background-color: white;
        }
      }
    }
  }
</style>
