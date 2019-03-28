<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder"/>
    <i @click="clearInput" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script type="text/ecmascript-6">
  import { debounce } from 'common/js/util'

  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data () {
      return {
        // 绑定搜索框数据与data数据 v-model
        query: ''
      }
    },
    created () {
      // 将输入框的内容暴露出去 便于调用
      // 延时执行 节省流量
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    },
    methods: {
      // 清空输入框
      clearInput () {
        this.query = ''
      },
      // 将待传文本放到输入框中(v-model已绑定data和box的数据)
      setQuery (newQuery) {
        this.query = newQuery
      },
      // 解除box的输入状态(添加对外的方法)
      blur () {
        this.$refs.query.blur()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-mi-yellow
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-mi-yellow
</style>
