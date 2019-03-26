import { commonParams } from './config'
import axios from 'axios'

// 获取歌词
export function getLyric (mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: +new Date(),
    needNewCode: 0,
    hostUin: 0,
    platform: 'yqq',
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
