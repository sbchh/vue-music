<template>
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listen-scroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll">
    <ul>
      <li v-for="(group, index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="(item,index) in group.items" :key="index" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shortcutList"
            :key="index" class="item"
            :class="{'current':currentIndex===index}"
            :data-index="index">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Loading from 'base/loading/loading'
  import Scroll from 'base/scroll/scroll'
  import { getData } from 'common/js/dom'

  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {

    // 定义全局变量
    created () {
      this.touch = {}
      this.listenScroll = true
      this.listHeight = []
      this.probeType = 3
    },

    // 初始化数据
    data () {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    // 定义部分结构体
    props: {
      data: {
        type: Array,
        default: () => []
      }
    },
    // 计算属性
    computed: {
      // 右侧快速入口列表 group->map每个元素的title
      shortcutList () {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },

      // 计算左侧滚动状态下滚轮固定的位置
      fixedTitle () {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }

    },
    // 实现的方法
    methods: {
      // 设置页面点击事件
      selectItem (item) {
        this.$emit('select', item)
      },
      // 右侧列表点击事件 e为对应字母的元素 实现点击相应字母左侧列表跳到对应的栏目上
      onShortcutTouchStart (e) {
        let anchorIndex = getData(e.target, 'index')
        // 获取第一次点击到的右侧列表位置
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },

      // 实现右侧滑动事件 防止浏览器原生滚动 添加stop.prevent修饰符
      onShortcutTouchMove (e) {
        // 计算滚动到第几个元素
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        // 计算右侧列表滚动的偏移量 偏移了几个歌手
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // 得到move时的anchorIndex
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },

      // 刷新
      refresh () {
        this.$refs.listview.refresh()
      },

      // 根据监听到的pos的x和y来绑定左右侧位置
      scroll (pos) {
        this.scrollY = pos.y
      },

      // 获取滚动右侧列表时 所对应的左侧列表位置
      _scrollTo (index) {
        // 右侧滚动列表没点上
        if (!index && index !== 0) {
          return
        }
        // 右侧滚动列表拖动到顶与底的时候
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        // 0 不延迟动画，直接到位
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        this.scrollY = -this.listHeight[index]
      },

      // 当listview的data发生变化时 计算每个Group高度
      // 得出移动右侧列表对应左侧区域的高度
      _calculateHeight () {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          // 当前Group下左侧列表项的区域
          height += item.clientHeight
          this.listHeight.push(height)
        }
      }
    },

    // 观测数据
    watch: {
      data () {
        this.$refs.fixed.style.background = '#157778'
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      // 观测右侧滑动时Y的变化
      scrollY (newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 当在中间区间滚动
        // 判断ScrollY落在左侧的哪个区间
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            // 计算当前区域位置
            this.currentIndex = i
            // 计算滚动差
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      // 观测滚动差
      diff (newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          // 当fixedTop和原本一致时
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    },

    // 注册组件
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-background-d
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-wechat-black
        font-size: $font-size-small
        &.current
          color: $color-mi-yellow
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-background-d
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
