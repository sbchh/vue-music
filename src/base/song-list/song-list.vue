<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(song,index)" v-for="(song, index) in songs" :key="index" class="item">
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      songs: {
        type: Array,
        default: () => []
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      // 派发点击事件
      selectItem (item, index) {
        this.$emit('select', item, index)
      },
      getDesc (song) {
        return `${song.singer}·${song.album}`
      },
      getRankCls (index) {
        if (index <= 2) {
          return index === 0 ? `first-text` : index === 1 ? 'second-text' : 'third-text'
        }
        return 'text'
      },
      getRankText (index) {
        return index + 1
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .first-text
          color: $color-text-first
          font-size: $font-size-large
          font-weight: bold
        .second-text
          color: $color-text-Second
          font-size: $font-size-large
          font-weight: bold
        .third-text
          color: $color-text-Third
          font-size: $font-size-large
          font-weight: bold
        .text
          color: $color-theme
          font-size: $font-size-large

      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
