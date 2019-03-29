// 抽象出歌曲类 方便多个页面调用
import { getLyric } from 'api/song'
import { ERR_OK } from 'api/config'
import { Base64 } from 'js-base64'

export default class Song {
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  // 获取歌词
  getLyric () {
    // 如果有歌词 则对歌词进行Base解密
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    // 如果未获取歌词 则先判断是否有歌词 有则解密 无则拒绝
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

// 传入musicData生成Song
export function createSong (musicData) {
  const guid = 9493927875
  const vkey = 'A6DFB779CE73582E02BC3CE3984C5C11340779B267C49CB35AFABA78A21947800E42334A2F5613BB6AE8381E48771D616364C2CB0CC70E09'
  const tagId = 38
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg`,
    url: `http://ws.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?guid=${guid}&vkey=${vkey}&fromtag=${tagId}`
  })
}

// 将歌手数组转换为 a/b/c... 的形式
function filterSinger (singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
