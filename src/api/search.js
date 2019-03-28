// 搜索请求接口
import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'
import axios from 'axios'

// 获取热门搜索数据
export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

// 获取搜索结果
export function getSearchRet (keyword, page, zhida, perpage) {
  const url = '/api/getSearchRet'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    w: keyword,
    p: page,
    perpage,
    n: perpage,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    needNewCode: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
