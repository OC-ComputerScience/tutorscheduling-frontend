import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from '@/router.js'
import store from '@/store/store.js'

import GoogleAuth from '@/config/google.js'
const gauthOption = {
  clientId: '158532899975-5qk486rajjjb3dqrdbp4h86a65l997ab.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GoogleAuth, gauthOption)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
