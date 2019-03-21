<template>
  <div class="singer">
    歌手页面
  </div>
</template>

<script type="text/ecmascript-6">
  import { getSingerList } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import Singer from 'common/js/singer'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10

  export default {
    data () {
      return {
        singers: []
      }
    },

    created () {
      this._getSingerList()
    },

    methods: {
      _getSingerList () {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = res.data.list
//            console.log(this.singers)
//            console.log(this._nomalizeSinger(this.singers))
          }
        })
      },
      // 重点 序列化歌手数据
      _nomalizeSinger (list) {
        // 定义热门歌手数组
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }

        // 遍历list数据
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            // 添加热门歌手信息
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }

          // 聚合数据
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
//        console.log(map)
        // 获取有序列表 map序列化
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          // 先把歌手姓名首字母 放在ret数组里
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            // 如果是热门 则放在hot数组里
            hot.push(val)
          }
        }

        // 对ret数组排序 得到a-Z升序的数组
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%

</style>
