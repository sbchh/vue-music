<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll class="shortcut" ref="shortcut" :data="shortcute">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="(item,index) in hotKey" :key="index">
                <span v-text="item.k"></span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showComfirm">
              <i class="icon-clear"></i>
            </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest @select="saveSearch" :query="query" @listScroll="blurInput" ref="suggest"></suggest>
    </div>
    <comfirm ref="comfirm" @comfirm="clearSearchHistory" text="是否清空所有搜索历史" confirmBtnText="清空"></comfirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import SearchList from 'base/search-list/search-list'
  import Suggest from 'components/suggest/suggest'
  import Comfirm from 'base/comfirm/comfirm'
  import Scroll from 'base/scroll/scroll'
  import { getHotKey } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { mapActions } from 'vuex'
  import { playlistMixin, searchMixin } from 'common/js/mixin'

  export default {
    mixins: [playlistMixin, searchMixin],
    created () {
      this._getHotKey()
    },
    data () {
      return {
        hotKey: []
      }
    },
    computed: {
      // 把热词和搜索记录统一成一条记录 触发滚动组件生效
      shortcute () {
        return this.hotKey.concat(this.searchHistory)
      }
    },
    methods: {
      // 显示确认提示框
      showComfirm () {
        this.$refs.comfirm.show()
      },
      // 当出现mini播放器时 在dom下补充一个60px的空间
      handlePlaylist (playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.searchResult.style.bottom = bottom
        // 通过suggest代理的refresh方法获取scroll的refresh方法
        this.$refs.suggest.refresh()

        this.$refs.shortcutWrapper.style.bottom = bottom
        // 刷新滚动组件
        this.$refs.shortcut.refresh()
      },
      // 获取热门搜索词
      _getHotKey () {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      // 将actions.js方法映射到search.vue
      ...mapActions([
        'clearSearchHistory'
      ])
    },
    watch: {
      query (newQuery) {
        // 当输入框没有变化时 强制对滚动组件进行刷新处理
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Comfirm,
      Scroll
    }
  }

</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-mi-gray
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
