<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {

    props: {
      // 监听滚动事件
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      // 监听滚动事件 获取滚动位置的x,y轴
      listenScroll: {
        type: Boolean,
        default: false
      },
      // 上拉刷新
      pullup: {
        type: Boolean,
        default: false
      },
      // 刷新演示200ms
      refreshDelay: {
        type: Number,
        default: 20
      }
    },

    mounted () {
      setTimeout(() => {
        this._initScroll()
      }, this.refreshDelay)
    },

    methods: {

      // 初始化滚动方法
      _initScroll () {
        if (!this.$refs.wrapper) {
          return false
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        if (this.listenScroll) {
          let me = this
          this.scroll.on('scroll', (pos) => {
            me.$emit('scroll', pos)
          })
        }
        if (this.pullup) {
          // 监听滑动结束事件
          this.scroll.on('scrollEnd', () => {
            // 如果滚动到底部 派发滚动到底部事件
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd')
            }
          })
        }
      },

      // 代理方法
      enable () {
        this.scroll && this.scroll.enable()
      },

      disable () {
        this.scroll && this.scroll.disable()
      },

      // 刷新方法 重新计算滚动区域高度
      refresh () {
        this.scroll && this.scroll.refresh()
      },

      // 滚动到相应位置 apply接受参数
      scrollTo () {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },

      // 滚动到具体元素
      scrollToElement () {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },

    // 延迟监测滚动事件
    watch: {
      data () {
        setTimeout(() => {
          this.refresh()
        }, this.refreshDelay)
      }
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
