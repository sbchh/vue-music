// 抽象出歌曲类 方便多个页面调用
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
}

// 传入musicData生成Song
export function createSong (musicData) {
  const guid = 9493927875
  const vkey = '677B9AB53B4FA515CC5FE14B092D89BCB6BF6C55AA3CEF6F5260160325D27361B6E43FE286E2853F270ABA3A4DEF5DC9A7791A86424430D0'
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
