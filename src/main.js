import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './router'
import store from './store/store'
import vuetify from './plugins/vuetify'

import GoogleAuth from '@/config/google.js'
const gauthOption = {
  clientId: '158532899975-5qk486rajjjb3dqrdbp4h86a65l997ab.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GoogleAuth, gauthOption)

Vue.use(VueRouter)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
