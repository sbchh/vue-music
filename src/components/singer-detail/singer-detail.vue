<template>
  <transition name="slide">
    <div class="singer-detail">

    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import { mapGetters } from 'vuex'
  import { getSingerDetail } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'

  export default {
    data () {
      return {
        song: []
      }
    },
    computed: {
      // 对应getters的singer
      ...mapGetters([
        'singer'
      ])
    },
    created () {
      this._getDetail()
    },
    methods: {
      _getDetail () {
        if (!this.singer.id) {
          // 如果歌单也获取不了歌单信息 返回到歌手页面
          this.$router.push('/singer')
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._nomalizeSongs(res.data.list)
            console.log(this.songs)
          }
        })
      },
      _nomalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .singer-detail
    position: fixed
    z-inde: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background

  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
