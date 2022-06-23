import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './router'
import store from './store/store'
import vuetify from './plugins/vuetify'
import vuePdf from 'vue-pdf'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

require('dotenv').config()

Vue.component('vue-pdf', vuePdf)

Vue.use(VueRouter)
Vue.config.productionTip = false

Vue.mixin({
  methods: {
    async handleCredentialResponse(response) {
      console.log(response);
      let token = { 
        credential : response.credential
      };
      return token;
    }
  }
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
