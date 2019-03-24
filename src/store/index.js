// 入口

import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

// 注册插件
Vue.use(Vuex)

// 线下调试 不建议线上使用
const debug = process.env.NODE_ENV !== 'production'

// 单例模式生成实例
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
