<template>
  <scroll class="suggest" :data="result" :pullup="pullup" @scrollToEnd="SearchMore" ref="suggest">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item,index) in result" :key="index" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import { getSearchRet } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import { mapMutations, mapActions } from 'vuex'
//  import {playlistMixin} from 'common/js/mixin'

  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default {
//    mixins:[playlistMixin],
    props: {
      // 搜索建议与搜索框内容相关
      query: {
        type: String,
        default: ''
      },
      // 是否显示歌手
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        // 当前搜索页
        page: 1,
        // 搜索结果
        result: [],
        // 需要上拉刷新
        pullup: true,
        // 标志位-有更多的数据可供上拉
        hasMore: true
      }
    },
    methods: {
//      handlePlaylist(this.query){},
      // 请求服务端 查询输入内容
      searchQuery () {
        // 每执行次查询 把suggest组件置为顶部
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0)
        getSearchRet(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      },
      // 监听滚动到底部事件 上拉搜索更多
      SearchMore () {
        if (!this.hasMore) {
          return
        }
        this.page++
        getSearchRet(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      // 根据歌手/歌曲 选择样式
      getIconCls (item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      // 根据歌手/歌曲 展示不同的内容
      getDisplayName (item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      // 根据歌手/歌曲 跳转到不同的页面 item为歌曲列表
      selectItem (songList) {
        if (songList.type === TYPE_SINGER) {
          const singer = new Singer({
            id: songList.singermid,
            name: songList.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          this.insertSong(songList)
        }
      },
      // 传入数据到state修改相应属性
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      // 传入数据到state触发相应事件
      ...mapActions([
        'insertSong'
      ]),
      // 检查是否有更多的搜索数据
      _checkMore (item) {
        const songList = item.song
        if (!songList.list.length || (songList.curnum + songList.curpage * perpage) > songList.totalnum) {
          this.hasMore = false
        }
      },
      // 处理得到的搜索结果 区分歌手与歌曲
      _genResult (data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      // 数据格式化成歌曲类
      _normalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    watch: {
      // 搜索词变化时 进行查询操作
      query () {
        this.searchQuery()
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
