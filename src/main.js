import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './router'
import store from './store/store'
import vuetify from './plugins/vuetify'
import vuePdf from 'vue-pdf'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// import AuthServices from '@/services/authServices'
// import Utils from '@/config/utils.js'
// import SocialLogin from '@/components/SocialLogin.vue'

require('dotenv').config()

Vue.component('vue-pdf', vuePdf)

Vue.use(VueRouter)
Vue.config.productionTip = false

// Vue.mixin({
//   methods: {
//     async handleCredentialResponse(response) {
//       console.log(response);
//       let token = { 
//         credential : response.credential
//       };
//       AuthServices.loginUser(token)
//       .then(response => {
//         this.user = response.data;
//         Utils.setStore("user", this.user);
//         this.name = this.user.fName;
//         console.log(this.user);
//         if(this.user.userID !== undefined)
//         {
//           console.log("out of google stuff 1")
//         }
//         console.log(SocialLogin.data())
//         SocialLogin.methods.setAccess();
//         SocialLogin.methods.openDialogs();
//       })
//       .catch(error => {
//         console.log('error', error);
//       })
//     }
//   }
// })

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

