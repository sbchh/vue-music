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
  const vkey = 'B50F9DB6B933431860790838BDDD7BEC185F03E21CB67F6050C40A892B36850A4B31D57FB5274E02EA77B409DEF7B1A46B290E953F3D6C58'
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
