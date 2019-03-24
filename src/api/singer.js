import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'
// import { commonParams } from './config'
// import axios from 'axios'

export function getSingerList () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })

  return jsonp(url, data, options)
  // axios.get(url, {
  //   params: data
  // }).then((res) => {
  //   return Promise.resolve(res.data)
  // })
}

export function getSingerDetail (singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 100,
    needNewCode: 0,
    ct: 24,
    singermid: singerId
  })
  return jsonp(url, data, options)
}
