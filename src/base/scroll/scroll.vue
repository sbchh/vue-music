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
      refreshDelay: {
        type: Number,
        default: 20
      }
    },

    mounted () {
      setTimeout(() => {
        this._initScroll()
      }, 20)
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
